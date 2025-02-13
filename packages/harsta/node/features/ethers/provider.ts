import { LazyInitializationProviderAdapter } from 'hardhat/internal/core/providers/lazy-initialization'
import type { ProviderForkingConfig } from '../network'
import { createProvider } from '../network'
import { hardhatConf, userConf } from '../../constants'

const forking: ProviderForkingConfig = {}

if (process.env.FORK && process.env.FORK !== 'undefined') {
  if (!process.env.FORK.startsWith('http'))
    forking.fork = userConf.networks?.[process.env.FORK].rpc
  else
    forking.fork = process.env.FORK
}

export function createLazyProvider(network: string) {
  return new LazyInitializationProviderAdapter(
    () => createProvider(
      hardhatConf,
      network,
      forking,
      userConf.proxy,
    ),
  )
}
