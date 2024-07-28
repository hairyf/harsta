import { BrowserProvider, FallbackProvider, JsonRpcProvider, JsonRpcSigner } from 'ethers'
import type { Account, Chain, Client, Transport } from 'viem'

export function clientToProvider(client: Client<Transport, Chain>) {
  if (!client)
    return
  const { chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  let provider: JsonRpcProvider

  if (transport.type === 'fallback') {
    const providers = (transport.transports as ReturnType<Transport>[]).map(
      ({ value }) => new JsonRpcProvider(value?.url, network),
    )
    if (providers.length === 1)
      return providers[0]
    provider = new FallbackProvider(providers) as unknown as JsonRpcProvider
  }
  else {
    provider = new JsonRpcProvider(transport.url, network)
  }

  Reflect.set(provider, 'chainId', chain.id)

  return provider
}

export function clientToSigner(client?: Client<Transport, Chain, Account>) {
  if (!client)
    return
  const { account, chain, transport } = client
  if (!chain) {
    return
  }
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new BrowserProvider(transport, network)
  const singer = new JsonRpcSigner(provider, account.address)

  Reflect.set(singer, 'chainId', chain.id)

  return singer
}
