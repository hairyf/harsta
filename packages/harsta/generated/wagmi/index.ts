/* eslint-disable ts/ban-ts-comment */
import { useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { BrowserProvider, JsonRpcProvider, JsonRpcSigner, Network } from 'ethers'
import { chain, updateProvider, updateSigner } from '../defaults'
import * as chains from '../chains'
import type { Chain } from '../types'

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
      const find = Object.values(chains).find((chain: any) => chain.id === chainId)
      const target: Chain | undefined = (find || chain) as any

      if (!target) {
        console.warn(`Chain with id ${chainId} not found config`)
        return
      }

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
