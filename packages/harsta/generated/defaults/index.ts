/* eslint-disable ts/ban-ts-comment */
import addresses from '../addresses'
import * as chains from '../chains'

const firstChainAlias = Object.keys(chains)[0] as keyof typeof chains
const envChainAlias = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ALIAS || process.env.DEFAULT_CHAIN_ALIAS) as keyof typeof chains
  : undefined

export const defaultChain = chains[envChainAlias || firstChainAlias] || chains[firstChainAlias]

// @ts-ignore
export const defaultAddresses = addresses[defaultChain.id]
