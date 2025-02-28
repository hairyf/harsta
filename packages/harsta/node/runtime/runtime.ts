import {
  addresses as _addresses,
  chain,
  chains,
  contracts,
  factories,
  fragments,
  provider,
  resolver,
  runner,
  signer,
  typechain,
  updateChain,
  updateProvider,
  updateRunner,
  updateSigner,
} from '../../generated'

export const addresses = _addresses as
  typeof _addresses &
  { 31337: Record<string, string> } &
  Record<string, Record<string, string>>

export {
  contracts,
  factories,
  fragments,
  chains,
  chain,
  provider,
  resolver,
  runner,
  signer,
  typechain,
  updateProvider,
  updateChain,
  updateRunner,
  updateSigner,
}

export {
  getExtendedArtifact,
  getArtifact,
  getChainId,
  network,
  getNamedAccount,
  getNamedAccounts,
  getNamedSigner,
  getSigner,
  getSigners,
  getUnnamedAccount,
  getUnnamedAccounts,
  manager,
  env,
} from '../features/environment'
