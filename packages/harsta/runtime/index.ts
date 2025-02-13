import {
  Events,
  Instances,
  Interfaces,
  addresses as _addresses,
  chains,
  contracts,
  defaultAddresses,
  defaultChain,
  defaults,
  fragments,
  provider,
  resolveRunner,
  runner,
  signer,
  typechains,
  updateProvider,
  updateRunner,
  updateSigner,
} from '../generated'

import {
  getChainId,
  getNamedAccount,
  getNamedAccounts,
  getNamedSinger,
  getSinger,
  getSingers,
  getUnnamedAccount,
  getUnnamedAccounts,
} from './utils'

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
  defaultAddresses,
  defaultChain,
  defaults,
  fragments,
  provider,
  resolveRunner,
  runner,
  signer,
  typechains,
  updateProvider,
  updateRunner,
  updateSigner,
}

export {
  getChainId,
  getNamedAccount,
  getNamedAccounts,
  getNamedSinger,
  getSinger,
  getSingers,
  getUnnamedAccount,
  getUnnamedAccounts,
}
