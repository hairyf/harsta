import { userConf } from '../../constants'
import type { DeploymentConfig } from '../../types'
import { network } from '../environment'
import { environment } from '../imports'
import { resolveInAddresses } from './storage'

export async function parseDeployArgs(config: DeploymentConfig) {
  const context = {
    addresses: await resolveInAddresses(),
    ...environment,
  }
  if (!config.args)
    return []

  if (Array.isArray(config.args))
    return config.args

  return await config.args(context)
}

export function parseDeployConfigs(filterContracts?: string[]) {
  const deployments = userConf.deployments || {}
  const array = Object
    .keys(deployments).map((name) => {
      return { name, target: name, ...deployments[name] }
    })
    .filter(item => (item.chains && network.id)
      ? item.chains.includes(network.id)
      : true)
    .filter(item => filterContracts
      ? filterContracts.includes(item.name)
      : true,
    )
  return array
}
