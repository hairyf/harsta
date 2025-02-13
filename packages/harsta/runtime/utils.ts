import { provider } from '../generated'
import { createDeploymentsManager } from '../node/features/deploy'
import { lazyEthereumProvider } from './network'

export const manager = createDeploymentsManager(lazyEthereumProvider, process.env.NETWORK!)

export async function getSingers() {
  return manager.getUnnamedAccounts().then(accounts => accounts.map(getSinger))
}

export async function getSinger(address: string) {
  return manager.deploymentsExtension.getSigner(address)
}

export async function getNamedAccounts() {
  return manager.getNamedAccounts()
}
export async function getUnnamedAccounts() {
  return manager.getUnnamedAccounts()
}

export async function getNamedAccount(name: string) {
  return getNamedAccounts().then(accounts => accounts[name])
}
export async function getUnnamedAccount() {
  return getUnnamedAccounts().then(accounts => accounts[0])
}

export async function getNamedSinger(name: string) {
  return getNamedAccount(name).then(getSinger)
}

export async function getChainId() {
  return manager.getChainId()
}
