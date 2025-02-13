import type { ContractFactory } from 'ethers'
import { BeaconProxyUnsupportedError, InitialOwnerUnsupportedKindError } from '@openzeppelin/upgrades-core'
import type { DeploymentConfig } from '../../types'
import { getProxyFactory, getTransparentUpgradeableProxyFactory } from './factories'

export async function getFactoryOptsInProxy(
  kind: string,
  implement: string,
  data: string,
  singer: any,
  options: DeploymentConfig = {},
) {
  const deployer = singer.address || await singer.getAddress()
  const owner = options.owner || deployer
  let args: any[] = []
  let factory: ContractFactory | undefined
  switch (kind) {
    case 'beacon': {
      throw new BeaconProxyUnsupportedError()
    }
    case 'uups': {
      if (options.owner)
        throw new InitialOwnerUnsupportedKindError(kind)
      factory = await getProxyFactory(singer)
      args = [implement, data]
      break
    }
    case 'transparent': {
      factory = await getTransparentUpgradeableProxyFactory(singer)
      args = [implement, owner, data]
      break
    }
  }

  if (!factory)
    throw new Error('Error: Not found proxy factory ')

  return [factory as ContractFactory, args] as [ContractFactory, unknown[]]
}
