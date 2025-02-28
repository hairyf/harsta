import type { Signer } from 'ethers'
import { ContractFactory } from 'ethers'
import ERC1967Proxy from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json'
import BeaconProxy from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/beacon/BeaconProxy.sol/BeaconProxy.json'
import UpgradeableBeacon from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/beacon/UpgradeableBeacon.sol/UpgradeableBeacon.json'
import TransparentUpgradeableProxy from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json'
import { BeaconProxyUnsupportedError, InitialOwnerUnsupportedKindError } from '@openzeppelin/upgrades-core'
import type { UserDeploymentConfig } from '../../types'

export async function getERC1967Proxy(signer?: Signer): Promise<ContractFactory> {
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

export async function getUpgradeFactory(kind: string, signer: Signer) {
  let factory: ContractFactory | undefined

  switch (kind) {
    case 'beacon': {
      throw new BeaconProxyUnsupportedError()
    }
    case 'uups': {
      factory = await getERC1967Proxy(signer)
      break
    }
    case 'transparent': {
      factory = await getTransparentUpgradeableProxyFactory(signer)
      break
    }
  }

  if (!factory)
    throw new Error('Error: Not found proxy factory ')

  return factory
}

export async function getUpgradeFactoryArgs(
  kind: string,
  implement: string,
  data: string,
  signer: Signer,
  options: UserDeploymentConfig = {},
) {
  const deployer = await signer.getAddress()
  const owner = options.owner || deployer

  let args: string[] = []
  switch (kind) {
    case 'beacon': {
      throw new BeaconProxyUnsupportedError()
    }
    case 'uups': {
      if (options.owner)
        throw new InitialOwnerUnsupportedKindError(kind)
      args = [implement, data]
      break
    }
    case 'transparent': {
      args = [implement, owner, data]
      break
    }
  }

  return args
}
