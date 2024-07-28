import type { HardhatRuntimeEnvironment } from 'hardhat/types'
import { userConf } from '../constants'

export async function parseDeploymentArgs(name: string, env: HardhatRuntimeEnvironment) {
  const deployments = userConf.deployments || {}
  if (!deployments[name] || !deployments[name].args)
    return []
  if (Array.isArray(deployments[name].args))
    return deployments[name].args
  return deployments[name].args(env)
}
