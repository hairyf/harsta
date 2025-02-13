/* eslint-disable ts/ban-ts-comment */
import addresses from '../addresses'
import * as chains from '../chains'

const firstChainAlias = Object.keys(chains)[0] as keyof typeof chains
const envChainAlias = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ALIAS
  || process.env.NEXT_PUBLIC_DEFAULT_CHAIN
  || process.env.NEXT_PUBLIC_CHAIN_ALIAS
  || process.env.NEXT_PUBLIC_CHAIN
  || process.env.NEXT_PUBLIC_NETWORK
  || process.env.DEFAULT_CHAIN_ALIAS
  || process.env.DEFAULT_CHAIN
  || process.env.CHAIN_ALIAS
  || process.env.CHAIN
  || process.env.NETWORK
    ) as keyof typeof chains
  : undefined

// @ts-ignore
export const defaults = {
  alias: envChainAlias || firstChainAlias,
  get chain() {
    return chains[this.alias] || chains[firstChainAlias]
  },
  get addresses() {
    // @ts-ignore
    return addresses[process.env.CHAIN_ID!] || addresses[this.chain.id]
  },
}

export const defaultChain = defaults.chain

// @ts-ignore
export const defaultAddresses = defaults.addresses
