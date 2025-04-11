/* eslint-disable ts/ban-ts-comment */
import type { ProviderForkingConfig } from '../features/network'
import { hardhatConf, userConf } from '../constants'
import { addresses } from '../../generated'

export const forking: ProviderForkingConfig = {}

if (process.env.FORK && process.env.FORK !== 'undefined') {
  if (!process.env.FORK.startsWith('http')) {
    process.env.FORK_CHAIN = process.env.FORK
    const hardhatChainId = hardhatConf.networks[process.env.NETWORK!].chainId!
    const forkChainId = userConf.networks?.[process.env.FORK_CHAIN].id
    const forkChainRPC = userConf.networks?.[process.env.FORK_CHAIN].rpc
    // @ts-ignore
    addresses[hardhatChainId] = addresses[hardhatChainId] ?? {}
    // @ts-ignore
    Object.assign(addresses[hardhatChainId], addresses[forkChainId])
    forking.fork = forkChainRPC
  }
  else {
    forking.fork = process.env.FORK
  }
}
