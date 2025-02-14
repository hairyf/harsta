import { DeploymentsManager } from 'hardhat-deploy/dist/src/DeploymentsManager'
import type { Environment } from 'hardhat/internal/core/runtime-environment'

export function createManager(env: Environment) {
  return new DeploymentsManager(env as any, env.network)
}
