import { Environment } from 'hardhat/internal/core/runtime-environment'
import type { ProviderForkingConfig } from '../network'
import { loadConfigAndTasks, loadEnvArguments, loadEnvContext } from './internal'

export function createEnvironment(network?: string, forking?: ProviderForkingConfig) {
  const ctxs = loadEnvContext()
  const args = loadEnvArguments(network)
  const configs = loadConfigAndTasks(args, { forking })

  return new Environment(
    configs.resolved,
    args,
    ctxs.tasksDSL.getTaskDefinitions(),
    ctxs.tasksDSL.getScopesDefinitions(),
    ctxs.environmentExtenders,
    [],
    configs.user,
    [],
  )
}
