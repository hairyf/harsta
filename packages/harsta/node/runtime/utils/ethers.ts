import { FetchRequest, JsonRpcProvider, Wallet } from 'ethers'
import env from 'hardhat'
import type { Provider } from 'ethers'
import { httpOverHttps, httpsOverHttp } from 'tunnel'
import type { EthereumProvider } from 'hardhat/types'

import { userConf } from '../../constants'
import type { HarstaProxyConfig } from '../../types'

let provider: EthereumProvider | undefined

export function getProvider(): EthereumProvider {
  const network = userConf.networks?.[process.env.NETWORK || '']
  if (!network)
    return env.network.provider
  return provider || (provider = new JsonRpcProvider(network.rpc) as any)
}

export async function getSinger(address: string) {
  const network = userConf.networks?.[process.env.NETWORK || '']
  if (!network)
    return await env.ethers.getSigner(address)
  const provider = new JsonRpcProvider(network?.rpc)
  const accounts = network?.deploy?.accounts || []
  const wallets = accounts
    .map(provideKey => new Wallet(provideKey, provider))
    .reduce(
      (mappings, value) => {
        mappings[value.address] = value
        return mappings
      },
      {} as Record<string, Wallet>,
    )
  return wallets[address] || await env.ethers.getSigner(address)
}

export async function getDeployer() {
  const unnamedAccounts = await env.getUnnamedAccounts()
  const namedAccounts = await env.getNamedAccounts()
  return namedAccounts.deployer || unnamedAccounts[0]
}

export async function getChainId() {
  const network = userConf.networks?.[process.env.NETWORK || '']
  return network?.id || await env.getChainId()
}

export async function applyAgent(proxy: HarstaProxyConfig) {
  const agent = proxy.https ? httpOverHttps({ proxy }) : httpsOverHttp({ proxy })
  const fetchRequest = env.ethers.FetchRequest.createGetUrlFunc({ agent })
  env.ethers.FetchRequest.registerGetUrl(fetchRequest)
  FetchRequest.registerGetUrl(fetchRequest)
}

export function fixedTaikoPending(provider: Provider) {
  const source = provider.getBlock
  provider.getBlock = function (block, prefetchTxs) {
    block === 'pending' && (block = 'latest')
    return source.call(this, block, prefetchTxs)
  }
}
