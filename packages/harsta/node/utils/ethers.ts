import { httpOverHttps, httpsOverHttp } from 'tunnel'
import type { Provider } from 'ethers'
import { FetchRequest } from 'ethers'
import type { HarstaProxyConfig } from '../types'

export function applyAgent(proxy: HarstaProxyConfig) {
  const agent = proxy.https ? httpOverHttps({ proxy }) : httpsOverHttp({ proxy })
  const fetchRequest = FetchRequest.createGetUrlFunc({ agent })
  FetchRequest.registerGetUrl(fetchRequest)
}

export function applyFixed(provider: Provider) {
  const source = provider.getBlock
  provider.getBlock = function (block, prefetchTxs) {
    block === 'pending' && (block = 'latest')
    return source.call(this, block, prefetchTxs)
  }
}
