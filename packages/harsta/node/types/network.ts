import type { HardhatNetworkUserConfig } from 'hardhat/types'

export interface NetworkUserConfig {
  rpc: string
  id: number
  name: string
  testnet?: boolean
  icon?: string

  currency: Currency
  verify?: Verify

  deploy?: Deploy

  explorer?: Explorer
}

export interface Deploy extends
  Omit<HardhatNetworkUserConfig, 'chainId' | 'chains' | 'url' | 'verify' | 'accounts'> {
  accounts?: any[]
  [key: string]: any
}

export interface Currency {
  name: string
  /** 2-6 characters long */
  symbol: string
  decimals: number
}

export interface Verify {
  uri?: string
  key?: string
}

export interface Metadata {

  name: string
  icon?: string
}

export interface Explorer {
  name: string
  url: string
}
