import type { HardhatUserConfig } from 'hardhat/config'
import type { NetworkUserConfig } from './network'
import type { DeploymentConfig } from './deployment'

export interface HarstaPathsConfig {
  fragments?: string
}
export interface HarstaUserConfig extends Omit<HardhatUserConfig, 'networks' | 'etherscan' | 'verify' | 'paths'> {
  deployments?: Record<string, DeploymentConfig>
  networks?: Record<string, NetworkUserConfig>
  paths?: HarstaPathsConfig
}
