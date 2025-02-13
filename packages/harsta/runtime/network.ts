/* eslint-disable ts/ban-ts-comment */
import { LazyInitializationProviderAdapter } from 'hardhat/internal/core/providers/lazy-initialization'
import type { ProviderForkingConfig } from '../node/network'
import { createProvider } from '../node/network'
import { userConf } from '../node/constants'
import { addresses } from '../generated'
import { hardhatConfig } from './config'

const forking: ProviderForkingConfig = {}

if (process.env.FORK && process.env.FORK !== 'undefined') {
  if (!process.env.FORK.startsWith('http')) {
    process.env.FORK_CHAIN = process.env.FORK
    const hardhatChainId = hardhatConfig.networks[process.env.NETWORK!].chainId!
    const forkChainId = userConf.networks?.[process.env.FORK_CHAIN].id
    const forkChainRPC = userConf.networks?.[process.env.FORK_CHAIN].rpc
    // @ts-expect-error
    addresses[hardhatChainId] = addresses[hardhatChainId] ?? {}
    // @ts-expect-error
    Object.assign(addresses[hardhatChainId], addresses[forkChainId])
    forking.fork = forkChainRPC
  }
  else {
    forking.fork = process.env.FORK
  }
}

if (process.env.FORK_BLOCK_NUMBER)
  forking.forkBlockNumber = +process.env.FORK_BLOCK_NUMBER

export const lazyEthereumProvider = new LazyInitializationProviderAdapter(
  () => createProvider(
    hardhatConfig,
    process.env.NETWORK!,
    forking,
    userConf.proxy,
  ),
)
