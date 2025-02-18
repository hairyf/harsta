import path from 'pathe'
import type { ChainConfig } from '@nomicfoundation/hardhat-verify/types'
import type { NetworkUserConfig as HardhatNetworkUserConfig, HardhatUserConfig } from 'hardhat/types'
import type { Chain, HarstaUserConfig, NetworkUserConfig } from '../types'
import { packRoot, userRoot } from '../constants'

export function transformHarstaConfigToHardhat(harstaUserConfig: HarstaUserConfig): HardhatUserConfig & { harsta: HarstaUserConfig } {
  const networks: Record<string, HardhatNetworkUserConfig> = {}

  const etherscan = {
    apiKey: {} as Record<string, string>,
    customChains: [] as ChainConfig[],
  }

  for (const alias in harstaUserConfig.networks) {
    const network = harstaUserConfig.networks[alias]
    networks[alias] = {
      url: network.rpc,
      chainId: network.id,
      ...network.deploy,
    }

    if (!network.verify)
      continue

    etherscan.apiKey[alias] = network.verify.key || ' '

    networks[alias]!.verify = {
      etherscan: {
        apiUrl: network.verify.api || `${network.verify.uri}/api`,
        apiKey: network.verify.key || '',
      },
    }
    etherscan.customChains.push({
      chainId: network.id,
      network: alias,
      urls: {
        apiURL: network.verify.api || `${network.verify.uri}/api`,
        browserURL: network.explorer?.url || network.verify.uri || '',
      },
    })
  }

  const config: any = {
    sourcify: { enabled: false },
    ...harstaUserConfig,
    networks,
    paths: {
      sources: path.resolve(packRoot, './contracts'),
      deploy: path.resolve(packRoot, './deploy'),
      tests: path.resolve(userRoot, './test'),
      cache: path.resolve(userRoot, './.harsta/cache'),
      artifacts: path.resolve(userRoot, './.harsta/artifacts'),
      deployments: path.resolve(userRoot, './.harsta/deployments'),
    },
    etherscan,
    typechain: { outDir: path.resolve(packRoot, './generated/typechains') },
    abiExporter: { path: path.resolve(packRoot, './generated/fragments') },
  }

  config.harsta = harstaUserConfig

  return config
}

export function transformNetworkToChain(network: NetworkUserConfig, addresses?: Record<string, string>) {
  const chain: Chain = {
    id: network.id,
    name: network.name,
    nativeCurrency: network.currency,
    rpcUrls: {
      default: { http: [network.rpc].filter(Boolean) },
      public: { http: [network.rpc].filter(Boolean) },
    },
    ...(network.explorer
      ? { blockExplorers: { default: network.explorer } }
      : {}),
    iconUrl: network?.icon,
    testnet: network.testnet,
    addresses: addresses || {},
  }

  return chain
}
