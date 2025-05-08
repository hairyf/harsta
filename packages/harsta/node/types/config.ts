import type { HardhatUserConfig } from 'hardhat/config'
import type { NetworkUserConfig } from './network'
import type { UserDeploymentConfig } from './deployment'

export interface HarstaPathsConfig {
  /**
   * contracts directory
   *
   * @default 'contracts'
   */
  sources?: string
  /**
   * addresses and external fragments directory
   *
   * @default 'config'
   */
  config?: string
  /**
   * contracts exports abi files path
   *
   * @default '.harsta/exports'
   */
  exports?: string
}

export interface HarstaProxyConfig {
  https?: boolean
  host: string
  port: number
}
export interface HarstaUserConfig extends Omit<HardhatUserConfig, 'namedAccounts' | 'networks' | 'etherscan' | 'verify' | 'paths'> {
  deployments?: Record<string, UserDeploymentConfig>
  networks?: Record<string, NetworkUserConfig>
  paths?: HarstaPathsConfig
  proxy?: HarstaProxyConfig
  namedAccounts?: {
    [name: string]:
      | string
      | number
      | { [network: string]: null | number | string }
  }
}
