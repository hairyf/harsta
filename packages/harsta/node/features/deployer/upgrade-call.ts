import { getAdminAddress, getCode, getUpgradeInterfaceVersion, isEmptySlot } from '@openzeppelin/upgrades-core'
import type { Signer, TransactionResponse } from 'ethers'
import consola from 'consola'
import { ethereumProvider } from '../environment'

import {
  attachITransparentUpgradeableProxyV4,
  attachITransparentUpgradeableProxyV5,
  attachProxyAdminV4,
  attachProxyAdminV5,
} from './attach'

export async function callUpgrade(address: string, implement: string, signer: Signer, call?: string) {
  const adminAddress = await getAdminAddress(ethereumProvider, address)
  const adminBytecode = await getCode(ethereumProvider, adminAddress)

  const overrides = [] as any[]
  let callback: (implement: string, call?: string) => Promise<TransactionResponse>

  if (isEmptySlot(adminAddress) || adminBytecode === '0x') {
    // No admin contract: use ITransparentUpgradeableProxy to get proxiable interface
    const upgradeInterfaceVersion = await getUpgradeInterfaceVersion(ethereumProvider, address)
    switch (upgradeInterfaceVersion) {
      case '5.0.0': {
        const proxy = await attachITransparentUpgradeableProxyV5(address, signer)
        callback = (implement, call) => proxy.upgradeToAndCall(implement, call ?? '0x', ...overrides)
        break
      }
      default: {
        if (upgradeInterfaceVersion !== undefined) {
          // Log as debug if the interface version is an unknown string.
          // Do not throw an error because this could be caused by a fallback function.
          consola.warn(
            `Unknown UPGRADE_INTERFACE_VERSION ${upgradeInterfaceVersion} for proxy at ${address}. Expected 5.0.0`,
          )
        }
        const proxy = await attachITransparentUpgradeableProxyV4(address, signer)
        callback = (implement, call) =>
          call ? proxy.upgradeToAndCall(implement, call) : proxy.upgradeTo(implement, ...overrides)
        break
      }
    }
  }
  else {
    // Admin contract: redirect upgrade call through it
    const upgradeInterfaceVersion = await getUpgradeInterfaceVersion(ethereumProvider, adminAddress)
    switch (upgradeInterfaceVersion) {
      case '5.0.0': {
        const admin = await attachProxyAdminV5(adminAddress, signer)
        callback = (implement, call) => admin.upgradeAndCall(address, implement, call ?? '0x', ...overrides)
        break
      }
      default: {
        if (upgradeInterfaceVersion !== undefined) {
          // Log as debug if the interface version is an unknown string.
          // Do not throw an error because this could be caused by a fallback function.
          consola.warn(
            `Unknown UPGRADE_INTERFACE_VERSION ${upgradeInterfaceVersion} for proxy admin at ${adminAddress}. Expected 5.0.0`,
          )
        }
        const admin = await attachProxyAdminV4(adminAddress, signer)
        callback = (implement, call) =>
          call
            ? admin.upgradeAndCall(address, implement, call, ...overrides)
            : admin.upgrade(address, implement, ...overrides)
        break
      }
    }
  }

  return callback(implement, call)
}
