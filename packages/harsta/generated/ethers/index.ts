import type { Provider, ContractRunner as Runner, Signer } from 'ethers'
import { proxy, resolveDefaultProvider } from '../utils'

export const { proxy: provider, update: updateProvider } = proxy<Provider>(resolveDefaultProvider())

export const { proxy: runner, update: updateRunner } = proxy<Runner>()

export const { proxy: signer, update: updateSigner } = proxy<Signer>()
