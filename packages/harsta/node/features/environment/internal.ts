import { loadConfigAndTasks as _loadConfigAndTasks } from 'hardhat/internal/core/config/config-loading'
import type { HardhatArguments } from 'hardhat/types'
import { getEnvHardhatArguments } from 'hardhat/internal/core/params/env-variables'
import { HARDHAT_PARAM_DEFINITIONS } from 'hardhat/internal/core/params/hardhat-params'
import path from 'pathe'
import { HardhatContext } from 'hardhat/internal/context'
import type { ProviderForkingConfig } from '../network'
import { packRoot } from '../../constants'

export interface LoadConfigAndTasksOptions {
  showEmptyConfigWarning?: boolean
  showSolidityConfigWarnings?: boolean
  forking?: ProviderForkingConfig
}
export function loadConfigAndTasks(
  hardhatArguments?: Partial<HardhatArguments>,
  options: LoadConfigAndTasksOptions = { },
) {
  const { resolvedConfig, userConfig } = _loadConfigAndTasks(hardhatArguments, options)

  if (options.forking && !resolvedConfig.networks.hardhat.forking) {
    resolvedConfig.networks.hardhat.forking = {
      blockNumber: options.forking.forkBlockNumber,
      url: options.forking.fork!,
      enabled: true,
    }
  }

  return {
    resolved: resolvedConfig,
    user: userConfig,
  }
}

export function loadEnvArguments(network?: string) {
  return {
    ...getEnvHardhatArguments(HARDHAT_PARAM_DEFINITIONS, process.env),
    config: path.resolve(packRoot, 'hardhat.config.ts'),
    network,
  }
}

export function loadEnvContext() {
  return HardhatContext.isCreated()
    ? HardhatContext.getHardhatContext()
    : HardhatContext.createHardhatContext()
}
