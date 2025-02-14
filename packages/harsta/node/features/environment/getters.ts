import type { Signer } from 'ethers'
import { manager } from '.'

export async function getSingers() {
  return manager.getUnnamedAccounts().then(accounts => accounts.map(getSinger)) as Promise<Signer[]>
}

export async function getSinger(address: string) {
  return manager.deploymentsExtension.getSigner(address) as unknown as Promise<Signer>
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
  return getNamedAccount(name).then(getSinger) as unknown as Promise<Signer>
}

export async function getChainId() {
  return manager.getChainId()
}

export async function getArtifact(name: string) {
  return manager.deploymentsExtension.getArtifact(name)
}

export async function getExtendedArtifact(name: string) {
  return manager.deploymentsExtension.getExtendedArtifact(name)
}
