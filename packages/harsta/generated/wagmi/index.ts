/* eslint-disable ts/ban-ts-comment */
import { useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { BrowserProvider, JsonRpcProvider, JsonRpcSigner, Network } from 'ethers'
import { chain, updateProvider, updateSigner } from '../defaults'
import * as chains from '../chains'

export function SubscribeWagmiConfig() {
  const account = useAccount()
  const chainId = useChainId()
  useEffect(
    () => {
      if (!account.address) {
        updateSigner(undefined)
        return
      }
      // @ts-expect-error
      const provider = new BrowserProvider(window.ethereum)
      const singer = new JsonRpcSigner(provider, account.address)
      updateSigner(singer)
    },
    [account.address],
  )
  useEffect(
    () => {
      const target = Object.values(chains).find(chain => chain.id === chainId) || chain
      const rpc = target.rpcUrls.default.http[0]
      const network = new Network(target.name, target.id)
      const provider = new JsonRpcProvider(rpc, network)
      Reflect.set(provider, 'chainId', target.id)
      updateProvider(provider)
    },
    [chainId],
  )
  return null
}
