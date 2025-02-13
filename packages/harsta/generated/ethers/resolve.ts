import { JsonRpcProvider, Network } from 'ethers'
import type { Chain, Runner } from '../types'
import { isChain, proxy } from '../utils'
import { provider, runner, signer } from './proxy'

export function resolveRunner(chainOrRunner: Chain | Runner | 'signer' | 'provider' = 'provider') {
  if (isChain(chainOrRunner)) {
    const rpc = chainOrRunner.rpcUrls.default.http[0]
    const network = new Network(chainOrRunner.name, chainOrRunner.id)
    const provider = new JsonRpcProvider(rpc, network)
    Reflect.set(provider, 'chainId', chainOrRunner.id)
    return provider
  }
  if (!chainOrRunner)
    return proxy.resolve(runner)! || proxy.resolve(provider)!
  if (chainOrRunner === 'signer')
    return proxy.resolve(signer)!
  if (chainOrRunner === 'provider')
    return proxy.resolve(provider)!
  return chainOrRunner
}
