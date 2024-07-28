import { useEffect } from 'react'
import { updateProvider, updateSigner } from '../ethers'
import { clientToProvider, clientToSigner } from './adapter'

interface ClientsForEthersAdaptersOptions {
  useClient: any
  useConnectorClient: any
}

export function subscribeEthersAdapters(options: ClientsForEthersAdaptersOptions) {
  const publicClient = options.useClient()
  const { data: walletClient } = options.useConnectorClient()
  useEffect(() => {
    const signer = clientToSigner(walletClient)
    const provider = clientToProvider(publicClient)
    signer && updateSigner(signer)
    provider && updateProvider(provider)
  }, [publicClient, walletClient])
}
