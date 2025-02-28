import type { environment } from '../features/imports'

export type HarstaRuntimeEnvironment = { addresses: Record<string, Record<string, string>> } & typeof environment

export type DeploymentArgs = any[] | ((env: HarstaRuntimeEnvironment) => Promise<any[]> | any[])

export interface UserDeploymentConfig {
  /**
   * Specify the chain scope for contract deployment
   */
  chains?: number[]

  /**
   * The deployed target contract name defaults to object key
   */
  target?: string

  /**
   * Contract upgradable mode
   *
   * @default false
   */
  kind?: 'beacon' | 'uups' | 'transparent' | false

  /**
   * Constructor for upgradable contracts
   *
   * @default 'initialize'
   */
  initializer?: false | string

  /**
   * Contract upgradable owner
   *
   * @default signer
   */
  owner?: string
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
