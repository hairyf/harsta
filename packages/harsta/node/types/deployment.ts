import type { HardhatRuntimeEnvironment } from 'hardhat/types'

export interface HarstaRuntimeEnvironment extends HardhatRuntimeEnvironment {
  getChainContract: (name: string) => Promise<string>
}

export type DeploymentArgs = any[] | ((env: HarstaRuntimeEnvironment) => Promise<any[]> | any[])

export interface DeploymentConfig {
  /**
   * Specify the chain scope for contract deployment
   */
  chains?: number[]

  /**
   * The deployed target contract name defaults to object key
   */
  target?: string

  /**
   * Contract update mode
   *
   * @default false
   */
  mode?: 'proxy' | 'uups' | false

  /**
   * Initialization parameters for deploying contracts
   *
   */
  args?: DeploymentArgs

  /**
   * The dependent pre contract, once set, will delay deployment
   *
   */
  dependencies?: string[]
}
