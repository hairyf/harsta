import { userConf } from '../constants'
import type { HarstaRuntimeEnvironment } from '../types'

export async function parseDeploymentArgs(name: string, env: HarstaRuntimeEnvironment) {
  const deployments = userConf.deployments || {}
  if (!deployments[name] || !deployments[name].args)
    return []
  if (Array.isArray(deployments[name].args))
    return deployments[name].args
  return deployments[name].args(env)
}
