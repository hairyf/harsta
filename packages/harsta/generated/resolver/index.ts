/* eslint-disable ts/ban-ts-comment */
import { JsonRpcProvider, Network } from 'ethers'
import type { Chain, Runner } from '../types'
import { isChain, proxy } from '../utils'
import { runner as _runner, chain, provider, signer } from '../defaults'
import addresses from '../addresses'

export function runner(chainOrRunner: Chain | Runner | 'signer' | 'provider' = 'provider') {
  if (isChain(chainOrRunner)) {
    const rpc = chainOrRunner.rpcUrls.default.http[0]
    const network = new Network(chainOrRunner.name, chainOrRunner.id)
    const provider = new JsonRpcProvider(rpc, network)
    Reflect.set(provider, 'chainId', chainOrRunner.id)
    return provider
  }

  if (!chainOrRunner)
    return proxy.resolve(_runner)! || proxy.resolve(provider)!
  if (chainOrRunner === 'signer')
    return proxy.resolve(signer)!
  if (chainOrRunner === 'provider')
    return proxy.resolve(provider)!
  return chainOrRunner
}

export function address(name: string, runner: any): string {
  if (!runner)
    return undefined as any
  let chainId: number

  try {
    chainId = Number(runner.provider._network.chainId)
  }
  catch {
    chainId = Reflect.get(runner, 'chainId')
  }
  // @ts-expect-error
  return addresses?.[chainId || chain.id]?.[name]
}
