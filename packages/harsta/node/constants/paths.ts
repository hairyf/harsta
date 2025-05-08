import path from 'pathe'
import { generatedRoot, packRoot, userRoot } from './root'

export const relativePaths = {
  userConfig: './config',
  userFragments: '',
  userAddresses: '',

  userTest: './test',
  userSources: './contracts',

  harstaCache: './.harsta/cache',
  harstaArtifacts: './.harsta/artifacts',
  harstaDeployments: './.harsta/deployments',
  harstaExports: './.harsta/exports',

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
  get userConfig() {
    return path.resolve(userRoot, relativePaths.userConfig)
  },

  get userFragments() {
    return relativePaths.userFragments
      ? path.resolve(userRoot, relativePaths.userFragments)
      : path.resolve(userRoot, `${relativePaths.userConfig}/fragments`)
  },
  get userAddresses() {
    return relativePaths.userAddresses
      ? path.resolve(userRoot, relativePaths.userAddresses)
      : path.resolve(userRoot, `${relativePaths.userConfig}/addresses`)
  },

  get userTest() {
    return path.resolve(userRoot, relativePaths.userTest)
  },
  get userSources() {
    return path.resolve(userRoot, relativePaths.userSources)
  },

  get harstaCache() {
    return path.resolve(userRoot, relativePaths.harstaCache)
  },
  get harstaArtifacts() {
    return path.resolve(userRoot, relativePaths.harstaArtifacts)
  },
  get harstaDeployments() {
    return path.resolve(userRoot, relativePaths.harstaDeployments)
  },
  get harstaExports() {
    return path.resolve(userRoot, relativePaths.harstaExports)
  },

  get packDeploy() {
    return path.resolve(packRoot, relativePaths.packDeploy)
  },
  get packSources() {
    return path.resolve(packRoot, relativePaths.packSources)
  },

  get generateFactories() {
    return path.resolve(generatedRoot, relativePaths.generateFactories)
  },
  get generateContracts() {
    return path.resolve(generatedRoot, relativePaths.generateContracts)
  },

  get generateFactoriesTypechain() {
    return path.resolve(generatedRoot, relativePaths.generateFactoriesTypechain)
  },
  get generateContractsTypechain() {
    return path.resolve(generatedRoot, relativePaths.generateContractsTypechain)
  },

  get generateFactoriesTypechainIndexTS() {
    return path.resolve(generatedRoot, relativePaths.generateFactoriesTypechainIndexTS)
  },
  get generateContractsTypechainIndexTS() {
    return path.resolve(generatedRoot, relativePaths.generateContractsTypechainIndexTS)
  },

  get generateFactoriesFragments() {
    return path.resolve(generatedRoot, relativePaths.generateFactoriesFragments)
  },
  get generateContractsFragments() {
    return path.resolve(generatedRoot, relativePaths.generateContractsFragments)
  },

  get generateChains() {
    return path.resolve(generatedRoot, relativePaths.generateChains)
  },
  get generateChainsIndexTS() {
    return path.resolve(generatedRoot, relativePaths.generateChainsIndexTS)
  },

  get generateAddresses() {
    return path.resolve(generatedRoot, relativePaths.generateAddresses)
  },
  get generateAddressesIndexTS() {
    return path.resolve(generatedRoot, relativePaths.generateAddressesIndexTS)
  },
}
