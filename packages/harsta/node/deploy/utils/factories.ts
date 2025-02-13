import type { Signer } from 'ethers'
import { ContractFactory } from 'ethers'
import ERC1967Proxy from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json'
import BeaconProxy from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/beacon/BeaconProxy.sol/BeaconProxy.json'
import UpgradeableBeacon from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/beacon/UpgradeableBeacon.sol/UpgradeableBeacon.json'
import TransparentUpgradeableProxy from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json'

export async function getProxyFactory(signer?: Signer): Promise<ContractFactory> {
  return new ContractFactory(ERC1967Proxy.abi, ERC1967Proxy.bytecode, signer)
}

export async function getTransparentUpgradeableProxyFactory(signer?: Signer) {
  return new ContractFactory(TransparentUpgradeableProxy.abi, TransparentUpgradeableProxy.bytecode, signer)
}

export async function getBeaconProxyFactory(signer?: Signer) {
  return new ContractFactory(BeaconProxy.abi, BeaconProxy.bytecode, signer)
}

export async function getUpgradeableBeaconFactory(signer?: Signer) {
  return new ContractFactory(UpgradeableBeacon.abi, UpgradeableBeacon.bytecode, signer)
}
