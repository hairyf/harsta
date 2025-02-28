/* eslint-disable no-restricted-globals */

import type { EthereumProvider } from 'hardhat/types'
import type { Provider, ContractRunner as Runner, Signer } from 'ethers'
import type { DeploymentsManager } from 'hardhat-deploy/dist/src/DeploymentsManager'
import type { Environment } from 'hardhat/internal/core/runtime-environment'
import type { NetworkUserConfig } from '../../types'

export interface HarstaGlobals {
  ethereumProvider?: EthereumProvider
  provider?: Provider
  runner?: Runner
  signer?: Signer
  network?: NetworkUserConfig & { alias: string }
  manager?: DeploymentsManager
  env?: Environment
}

export const globals: HarstaGlobals = (global as any)?.harsta || {}
