import env from 'hardhat'
import { userConf } from '../../constants'
import { resolveAddress } from './storage'

export async function getArtifact(target: string) {
  return env.deployments.getExtendedArtifact(target)
}

export async function getArgs(name: string) {
  const deployments = userConf.deployments || {}
  if (!deployments[name] || !deployments[name].args)
    return []
  if (Array.isArray(deployments[name].args))
    return deployments[name].args
  return deployments[name].args({ getChainContract: resolveAddress, ...env })
}
