import type { HardhatRuntimeEnvironment } from 'hardhat/types'

export { HardhatRuntimeEnvironment }

export type DeploymentArgs = any[] | ((env: HardhatRuntimeEnvironment) => Promise<any[]> | any[])

export interface DeploymentConfig {
  update?: 'proxy' | 'uups' | false
  args?: DeploymentArgs
  type?: 'async' | 'defer' | 'sync'
}
