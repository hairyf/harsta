/* eslint-disable ts/ban-ts-comment */
import { JsonRpcProvider, Network, type Provider, type ContractRunner as Runner, type Signer } from 'ethers'
import { proxy } from '../utils'
import { chain } from './chain'

function resolveDefaultProvider() {
  if (!proxy.resolve(chain))
    return
  // @ts-ignore
  return new JsonRpcProvider(chain.rpcUrls.default.http[0], new Network(chain.name, chain.id),
  )
}

export const defaultProvider = resolveDefaultProvider()

export const { proxy: provider, update: updateProvider } = proxy<Provider>(defaultProvider)

export const { proxy: runner, update: updateRunner } = proxy<Runner>()

export const { proxy: signer, update: updateSigner } = proxy<Signer>()
