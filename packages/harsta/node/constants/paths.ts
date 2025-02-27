import path from 'pathe'
import { generatedRoot, packRoot, userRoot } from './root'

export const relativePaths = {
  userFragments: './config/externally',

  userTest: './test',
  userSources: './contracts',

  harstaCache: './.harsta/cache',
  harstaArtifacts: './.harsta/artifacts',
  harstaDeployments: './.harsta/deployments',

  packDeploy: './deploy',
  packSources: './contracts',

  generateFactories: './factories',
  generateContracts: './contracts',

  generateFactoriesTypechain: './_typechain-factories',
  generateContractsTypechain: './_typechain-contracts',

  generateFactoriesTypechainIndexTS: './_typechain-factories/index.ts',
  generateContractsTypechainIndexTS: './_typechain-contracts/index.ts',

  generateFactoriesFragments: './_fragments-factories',
  generateContractsFragments: './_fragments-contracts',

  generateChains: './chains',
  generateChainsIndexTS: './chains/index.ts',

  generateAddresses: './addresses',
  generateAddressesIndexTS: './addresses/index.ts',
}

export const absolutePaths = {
  userFragments: path.resolve(userRoot, relativePaths.userFragments),

  userTest: path.resolve(userRoot, relativePaths.userTest),
  userSources: path.resolve(userRoot, relativePaths.userSources),

  harstaCache: path.resolve(userRoot, relativePaths.harstaCache),
  harstaArtifacts: path.resolve(userRoot, relativePaths.harstaArtifacts),
  harstaDeployments: path.resolve(userRoot, relativePaths.harstaDeployments),

  packDeploy: path.resolve(packRoot, relativePaths.packDeploy),
  packSources: path.resolve(packRoot, relativePaths.packSources),

  generateFactories: path.resolve(generatedRoot, relativePaths.generateFactories),
  generateContracts: path.resolve(generatedRoot, relativePaths.generateContracts),

  generateFactoriesTypechain: path.resolve(generatedRoot, relativePaths.generateFactoriesTypechain),
  generateContractsTypechain: path.resolve(generatedRoot, relativePaths.generateContractsTypechain),

  generateFactoriesTypechainIndexTS: path.resolve(generatedRoot, relativePaths.generateFactoriesTypechainIndexTS),
  generateContractsTypechainIndexTS: path.resolve(generatedRoot, relativePaths.generateContractsTypechainIndexTS),

  generateFactoriesFragments: path.resolve(generatedRoot, relativePaths.generateFactoriesFragments),
  generateContractsFragments: path.resolve(generatedRoot, relativePaths.generateContractsFragments),

  generateChains: path.resolve(generatedRoot, relativePaths.generateChains),
  generateChainsIndexTS: path.resolve(generatedRoot, relativePaths.generateChainsIndexTS),

  generateAddresses: path.resolve(generatedRoot, relativePaths.generateAddresses),
  generateAddressesIndexTS: path.resolve(generatedRoot, relativePaths.generateAddressesIndexTS),
}
