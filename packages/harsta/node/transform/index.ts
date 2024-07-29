import path from 'node:path'
import type { ChainConfig } from '@nomicfoundation/hardhat-verify/types'
import type { HarstaUserConfig } from '../types'
import { packRoot, userRoot } from '../constants'

export function transformHarstaConfigToHardhat(harstaUserConfig: HarstaUserConfig) {
  const networks: any = {}

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
    etherscan.apiKey[alias] = ' '
    networks[alias]!.verify = {
      etherscan: {
        apiUrl: network.verify.uri,
        apiKey: network.verify.key || '',
      },
    }
  }

  const config: any = {
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
