import * as chains from '../chains'

export const ALIAS_FIRST = Object.keys(chains).filter(k => k !== 'default')[0] as keyof typeof chains
export const ALIAS_ENV = typeof process !== 'undefined'
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
