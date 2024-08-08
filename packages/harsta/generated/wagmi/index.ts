import { useEffect } from 'react'
import { updateProvider, updateSigner } from '../ethers'
import { clientToProvider, clientToSigner } from './adapter'

export interface SubscribeWagmiConfigProps {
  useClient: any
  useConnectorClient: any
}

export function SubscribeWagmiConfig(props: SubscribeWagmiConfigProps) {
  const publicClient = props.useClient()
  const { data: walletClient } = props.useConnectorClient()
  useEffect(() => {
    const signer = clientToSigner(walletClient)
    const provider = clientToProvider(publicClient)
    signer && updateSigner(signer)
    provider && updateProvider(provider)
  }, [publicClient, walletClient])
  return null
}
