import {
  Events,
  Instances,
  Interfaces,
  addresses as _addresses,
  chain,
  chains,
  contracts,
  fragments,
  provider,
  resolver,
  runner,
  signer,
  typechains,
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
  Events,
  Instances,
  Interfaces,
  chains,
  contracts,
  chain,
  fragments,
  provider,
  resolver,
  runner,
  signer,
  typechains,
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
