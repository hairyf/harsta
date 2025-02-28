import { proxy } from './utils'
import { globals } from './globals'

export const { proxy: ethereumProvider, update: updateEthereumProvider } = proxy(globals?.ethereumProvider)

export const { proxy: provider, update: updateProvider } = proxy(globals?.provider)

export const { proxy: runner, update: updateRunner } = proxy(globals?.runner)

export const { proxy: signer, update: updateSigner } = proxy(globals?.signer)

export const { proxy: network, update: updateNetwork } = proxy(globals?.network)

export const { proxy: manager, update: updateManager } = proxy(globals?.manager)

export const { proxy: env, update: updateEnv } = proxy(globals?.env)
