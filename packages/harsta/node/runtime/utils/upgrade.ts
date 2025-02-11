import type { Signer, TransactionResponse } from 'ethers'
import { getAdminAddress, getCode, getUpgradeInterfaceVersion, isEmptySlot } from '@openzeppelin/upgrades-core'
import consola from 'consola'
import {
  attachITransparentUpgradeableProxyV4,
  attachITransparentUpgradeableProxyV5,
  attachProxyAdminV4,
  attachProxyAdminV5,
} from './attach'
import * as ethers from './ethers'

type Upgrader = (implement: string, call?: string) => Promise<TransactionResponse>

async function getUpgrader(address: string, signer: Signer): Promise<Upgrader> {
  const provider = ethers.getProvider()

  const adminAddress = await getAdminAddress(provider, address)
  const adminBytecode = await getCode(provider, adminAddress)

  const overrides = [] as any[]

  if (isEmptySlot(adminAddress) || adminBytecode === '0x') {
    // No admin contract: use ITransparentUpgradeableProxy to get proxiable interface
    const upgradeInterfaceVersion = await getUpgradeInterfaceVersion(provider, address)
    switch (upgradeInterfaceVersion) {
      case '5.0.0': {
        const proxy = await attachITransparentUpgradeableProxyV5(address, signer)
        return (implement, call) => proxy.upgradeToAndCall(implement, call ?? '0x', ...overrides)
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
        return (implement, call) =>
          call ? proxy.upgradeToAndCall(implement, call) : proxy.upgradeTo(implement, ...overrides)
      }
    }
  }
  else {
    // Admin contract: redirect upgrade call through it
    const upgradeInterfaceVersion = await getUpgradeInterfaceVersion(provider, adminAddress)
    switch (upgradeInterfaceVersion) {
      case '5.0.0': {
        const admin = await attachProxyAdminV5(adminAddress, signer)
        return (implement, call) => admin.upgradeAndCall(address, implement, call ?? '0x', ...overrides)
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
        return (implement, call) =>
          call
            ? admin.upgradeAndCall(address, implement, call, ...overrides)
            : admin.upgrade(address, implement, ...overrides)
      }
    }
  }
}

export async function upgradeToCall(address: string, implement: string, signer: Signer) {
  const upgradeTo = await getUpgrader(address, signer)
  return upgradeTo(implement)
}
