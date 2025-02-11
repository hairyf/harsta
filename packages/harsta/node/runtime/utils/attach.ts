import type { Signer } from 'ethers'
import { Contract } from 'ethers'

import ITransparentUpgradeableProxyV5 from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/transparent/TransparentUpgradeableProxy.sol/ITransparentUpgradeableProxy.json'
import ITransparentUpgradeableProxyV4 from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/ITransparentUpgradeableProxy.json'

import ProxyAdminV5 from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json'
import ProxyAdminV4 from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json'

export async function attachITransparentUpgradeableProxyV5(address: string, signer: Signer) {
  return new Contract(address, ITransparentUpgradeableProxyV5.abi, signer)
}

export async function attachITransparentUpgradeableProxyV4(address: string, signer: Signer) {
  return new Contract(address, ITransparentUpgradeableProxyV4.abi, signer)
}

export async function attachProxyAdminV5(address: string, signer: Signer) {
  return new Contract(address, ProxyAdminV5.abi, signer)
}

export async function attachProxyAdminV4(address: string, signer: Signer) {
  return new Contract(address, ProxyAdminV4.abi, signer)
}
