import { getEnvHardhatArguments } from 'hardhat/internal/core/params/env-variables'
import { HARDHAT_PARAM_DEFINITIONS } from 'hardhat/internal/core/params/hardhat-params'
import { Environment } from 'hardhat/internal/core/runtime-environment'
import { loadConfigAndTasks } from 'hardhat/internal/core/config/config-loading'
import { HardhatContext } from 'hardhat/internal/context'
import path from 'pathe'
import { packRoot } from '../../constants'
import type { ProviderForkingConfig } from '../network'

export function createEnvironment(network?: string, forking?: ProviderForkingConfig) {
  const context = HardhatContext.isCreated()
    ? HardhatContext.getHardhatContext()
    : HardhatContext.createHardhatContext()

  const args = {
    ...getEnvHardhatArguments(HARDHAT_PARAM_DEFINITIONS, process.env),
    config: path.resolve(packRoot, 'hardhat.config.ts'),
  }

  const { resolvedConfig, userConfig } = loadConfigAndTasks(args)
  if (forking && !resolvedConfig.networks.hardhat.forking) {
    resolvedConfig.networks.hardhat.forking = {
      url: forking.fork!,
      enabled: true,
      blockNumber: forking.forkBlockNumber,
    }
  }

  return new Environment(
    resolvedConfig,
    { ...args, network },
    context.tasksDSL.getTaskDefinitions(),
    context.tasksDSL.getScopesDefinitions(),
    context.environmentExtenders,
    userConfig,
    [async provider => provider],
  )
}
