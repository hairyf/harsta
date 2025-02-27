import * as factories from './_typechain-factories'
import * as contracts from './_typechain-contracts'

export * as fragments from './_fragments-contracts'

export * as Instances from './instances'
export * as Interfaces from './interfaces'
export * as Events from './events'
export * as factories from './factories'
export * as contracts from './contracts'
export * as chains from './chains'
export * as resolver from './resolver'

export * from './defaults'

export const typechains = { factories, contracts }
export { default as addresses } from './addresses'
