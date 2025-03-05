import { BrowserProvider, JsonRpcApiProvider, Network, type Signer } from 'ethers'

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
  updateRunner,
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

  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  await environment.network.provider.init?.()
  const provider = new BrowserProvider(
    environment.network.provider,
    new Network(network, config.id),
    { staticNetwork: true },
  )

  const manager = createManager(environment)

  updateNetwork({ ...config, alias: network })
  updateProvider(provider)
  updateEthereumProvider(ethereumProvider)

  updateManager(manager)
  updateEnv(environment)

  const namedAccount = await manager.getNamedAccounts().then(accounts => accounts.deployer)
  const unnamedAccount = await manager.getUnnamedAccounts().then(accounts => accounts[0])
  const signer = await manager.deploymentsExtension.getSigner(namedAccount || unnamedAccount)
  Reflect.set(signer, 'chainId', config.id)

  updateSigner(signer as unknown as Signer)
  updateRunner(signer as unknown as Signer)
}
