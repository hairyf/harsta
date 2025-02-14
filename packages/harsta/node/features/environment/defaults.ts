import type { Provider, ContractRunner as Runner, Signer } from 'ethers'
import type { EthereumProvider } from 'hardhat/types'
import type { DeploymentsManager } from 'hardhat-deploy/dist/src/DeploymentsManager'
import type { Environment } from 'hardhat/internal/core/runtime-environment'
import type { NetworkUserConfig } from '../../types'
import { proxy } from './utils'

export const { proxy: ethereumProvider, update: updateEthereumProvider } = proxy<EthereumProvider>()

export const { proxy: provider, update: updateProvider } = proxy<Provider>()

export const { proxy: runner, update: updateRunner } = proxy<Runner>()

export const { proxy: signer, update: updateSigner } = proxy<Signer>()

export const { proxy: network, update: updateNetwork } = proxy<NetworkUserConfig>()

export const { proxy: manager, update: updateManager } = proxy<DeploymentsManager>()

export const { proxy: env, update: updateEnv } = proxy<Environment>()
