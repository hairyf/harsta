/* eslint-disable ts/ban-ts-comment */
import { Wallet } from 'ethers'
import { provider } from '../generated'
import { hardhatConfig, privateKeys } from './config'

const _accounts = new Map<string, number>([])
let index = 0

export function getSingers() {
  return getUnnamedAccounts().map(getSinger)
}

export function getSinger(address: string) {
  return new Wallet(privateKeys[address], provider)
}

export function getNamedAccounts(): Record<string, string> {
  if (process.env.NETWORK === 'hardhat') {
    const proxy = new Proxy<any>({}, {
      get: (_, name: string) => {
        if (!_accounts.has(name))
          _accounts.set(name, index++)
        return getUnnamedAccounts()[_accounts.get(name)!]
      },
    })
    return proxy as any
  }
  const addresses = getUnnamedAccounts()
  const namedAccounts = hardhatConfig.namedAccounts
  const accounts: Record<string, string> = {}
  const network = process.env.NETWORK!
  const chainId = hardhatConfig.networks[network].chainId!
  for (const name in namedAccounts) {
    // @ts-ignore
    const index = namedAccounts[name][chainId] || namedAccounts[name].default
    accounts[name] = addresses[index]
  }
  return accounts
}

export function getNamedAccount(name: string): string {
  return getNamedAccounts()[name]
}
export function getUnnamedAccount() {
  return getUnnamedAccounts()[0]
}

export function getNamedSinger(name: string) {
  return getSinger(getNamedAccount(name))
}

export function getUnnamedAccounts() {
  return Object.values(privateKeys).map(account => new Wallet(account).address)
}

export function getChainId() {
  return hardhatConfig.networks[process.env.NETWORK!].chainId!
}
