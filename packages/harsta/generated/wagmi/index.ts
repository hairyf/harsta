import { useEffect } from 'react'
import { useClient, useConnectorClient } from 'wagmi'
import { updateProvider, updateSigner } from '../ethers'
import { clientToProvider, clientToSigner } from './adapter'

export function SubscribeWagmiConfig() {
  const publicClient = useClient()
  const { data: walletClient } = useConnectorClient()
  useEffect(() => {
    const signer = clientToSigner(walletClient)
    const provider = clientToProvider(publicClient)
    signer && updateSigner(signer)
    provider && updateProvider(provider)
  }, [publicClient, walletClient])
  return null
}
