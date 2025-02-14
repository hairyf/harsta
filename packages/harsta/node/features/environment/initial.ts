/* eslint-disable ts/ban-ts-comment */
import { HardhatEthersProvider } from '@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider'
import { JsonRpcApiProvider, type Signer } from 'ethers'
import { userConf } from '../../constants'
import type { ProviderForkingConfig } from '../network/provider'
import { applyAgent, applyFixed } from '../../utils'
import { DEFAULT_HARDHAT_NETWORK_CONFIG } from './config'
import {
  updateEnv,
  updateEthereumProvider,
  updateManager,
  updateNetwork,
  updateProvider,
  updateSigner,
} from './defaults'
import { createManager } from './manager'
import { createEnvironment } from './environment'

export async function initial(network: string, forking?: ProviderForkingConfig) {
  const config = network === 'hardhat'
    ? DEFAULT_HARDHAT_NETWORK_CONFIG
    : userConf.networks![network]

  applyFixed(JsonRpcApiProvider.prototype)
  userConf.proxy && applyAgent(userConf.proxy)

  const environment = createEnvironment(network, forking)

  const ethereumProvider = environment.network.provider

  // @ts-expect-error
  await environment.network.provider.init?.()

  const provider = new HardhatEthersProvider(environment.network.provider, network)
  const manager = createManager(environment)

  Reflect.set(provider, 'chainId', config.id)

  updateNetwork({ ...config, alias: network })
  updateProvider(provider)
  updateEthereumProvider(ethereumProvider)

  updateManager(manager)
  updateEnv(environment)

  const namedAccount = await manager.getNamedAccounts().then(accounts => accounts.deployer)
  const unnamedAccount = await manager.getUnnamedAccounts().then(accounts => accounts[0])
  const singer = await manager.deploymentsExtension.getSigner(namedAccount || unnamedAccount)
  Reflect.set(singer, 'chainId', config.id)

  updateSigner(singer as unknown as Signer)
}
