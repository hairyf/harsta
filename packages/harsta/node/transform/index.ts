import type { NetworkUserConfig as HardhatNetworkUserConfig, HardhatUserConfig } from 'hardhat/types'
import type { Chain, HarstaUserConfig, NetworkUserConfig } from '../types'
import { absolutePaths, relativePaths } from '../constants/paths'

export function transformHarstaConfigToHardhat(harstaUserConfig: HarstaUserConfig): HardhatUserConfig & { harsta: HarstaUserConfig } {
  const networks: Record<string, HardhatNetworkUserConfig> = {}
  relativePaths.userSources = harstaUserConfig.paths?.sources || relativePaths.userSources
  relativePaths.userConfig = harstaUserConfig.paths?.config || relativePaths.userConfig
  relativePaths.harstaExports = harstaUserConfig.paths?.exports || relativePaths.harstaExports

  const etherscan = {
    apiKey: {} as Record<string, string>,
    customChains: [] as any[],
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
    etherscan,
    networks,
    paths: {
      sources: absolutePaths.packSources,
      deploy: absolutePaths.packDeploy,
      tests: absolutePaths.userTest,
      cache: absolutePaths.harstaCache,
      artifacts: absolutePaths.harstaArtifacts,
      deployments: absolutePaths.harstaDeployments,
    },
    typechain: { outDir: absolutePaths.generateFactoriesTypechain },
    abiExporter: { path: absolutePaths.generateFactoriesFragments },
  }

  config.harsta = harstaUserConfig

  return config
}

export function transformNetworkToChain(network: NetworkUserConfig, addresses?: Record<string, string>) {
  const chain: Chain = {
    id: network.id,
    name: network.name,
    nativeCurrency: network.currency!,
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
