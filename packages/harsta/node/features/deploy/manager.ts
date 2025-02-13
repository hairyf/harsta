import { DeploymentsManager } from 'hardhat-deploy/dist/src/DeploymentsManager'
import { Artifacts } from 'hardhat/internal/artifacts'
import type { EthereumProvider } from 'hardhat/types'
import { hardhatConf } from '../../constants'

// TODO
export function getUserExtendedArtifact() {}

export function createDeploymentsManager(provider: EthereumProvider, network: string) {
  const env: any = {
    run: async () => {},
    artifacts: new Artifacts(hardhatConf.paths.artifacts),
    config: hardhatConf,
    network: {
      name: network,
      config: hardhatConf.networks[network],
      provider,
    },
  }
  return new DeploymentsManager(env, env.network)
}
