import type { JsonRpcProvider, JsonRpcSigner } from 'ethers'
import { proxy, resolveDefaultProvider } from '../utils'

export const { proxy: runner, update: updateRunner } = proxy<JsonRpcProvider | JsonRpcSigner>()

export const { proxy: signer, update: updateSigner } = proxy<JsonRpcSigner>()

export const { proxy: provider, update: updateProvider } = proxy<JsonRpcProvider>(resolveDefaultProvider())
