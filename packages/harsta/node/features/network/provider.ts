import { createProvider as _createProvider } from 'hardhat/internal/core/providers/construction'
import { Artifacts } from 'hardhat/internal/artifacts'
import { HARDHAT_NETWORK_NAME } from 'hardhat/internal/constants'
import { HardhatError } from 'hardhat/internal/core/errors'
import type { HardhatConfig } from 'hardhat/types'

import { ERRORS } from 'hardhat/internal/core/errors-list'
import { JsonRpcApiProvider } from 'ethers'
import { applyAgent, applyFixed } from '../../utils'
import type { HarstaProxyConfig } from '../../types'

applyFixed(JsonRpcApiProvider.prototype)

export interface ProviderForkingConfig {
  forkBlockNumber?: number
  fork?: string
}

export async function createProvider(
  config: HardhatConfig,
  network: string,
  forking: ProviderForkingConfig = {},
  proxy?: HarstaProxyConfig,
) {
  proxy && applyAgent(proxy)
  const artifacts = new Artifacts(config.paths.artifacts)
  const provider = await _createProvider(config, network, artifacts)

  if (network !== HARDHAT_NETWORK_NAME)
    return provider

  const hardhatNetworkConfig = config.networks[HARDHAT_NETWORK_NAME]

  const forkUrlConfig = hardhatNetworkConfig.forking?.url
  const forkBlockNumberConfig = hardhatNetworkConfig.forking?.blockNumber

  const forkUrl = forking.fork ?? forkUrlConfig
  const forkBlockNumber = forking.forkBlockNumber ?? forkBlockNumberConfig

  // we throw an error if the user specified a forkBlockNumber but not a
  // forkUrl
  if (forkBlockNumber !== undefined && forkUrl === undefined)
    throw new HardhatError(ERRORS.BUILTIN_TASKS.NODE_FORK_BLOCK_NUMBER_WITHOUT_URL)

  // if the url or the block is different to the one in the configuration,
  // we use hardhat_reset to set the fork
  if (forkUrl !== forkUrlConfig || forkBlockNumber !== forkBlockNumberConfig) {
    const forkOptions = { jsonRpcUrl: forkUrl, blockNumber: forkBlockNumber }
    await provider.request({
      params: [{ forking: forkOptions }],
      method: 'hardhat_reset',
    })
  }

  const hardhatNetworkUserConfig = config.networks?.[HARDHAT_NETWORK_NAME] ?? {}
  await provider.request({
    method: 'hardhat_setLoggingEnabled',
    params: [hardhatNetworkUserConfig.loggingEnabled ?? true],
  })

  return provider
}
