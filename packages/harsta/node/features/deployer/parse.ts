import { userConf } from '../../constants'
import type { DeploymentConfig } from '../../types'
import { network } from '../environment'
import { environment } from '../imports'
import { getAddresses } from './storage'

export async function parseArgs(config: DeploymentConfig) {
  const context = {
    addresses: await getAddresses(),
    ...environment,
  }
  if (!config.args)
    return []

  if (Array.isArray(config.args))
    return config.args

  return await config.args(context)
}

export function parseConfigs(includes?: string[]) {
  if (includes?.[0] === 'all')
    includes = []

  const deployments = userConf.deployments || {}

  const array = Object.keys(deployments)
    .map(name => ({ name, target: name, ...deployments[name] }))
    .filter(item =>
      (!item.chains || item.chains.includes(network.id))
      && (!includes || includes.includes(item.name)),
    )

  return array
}

export function parseConfig(name: string) {
  const deployments = userConf.deployments || {}
  return { name, target: name, ...deployments[name] }
}
