import { provider, updateSigner } from '../generated'
import { hardhatConfig } from './config'
import { getNamedAccount, getSinger, getUnnamedAccount } from './utils'

export const singer = getSinger(getNamedAccount('deployer') || getUnnamedAccount())

Reflect.set(provider, 'chainId', hardhatConfig.networks[process.env.NETWORK!].chainId)
Reflect.set(singer, 'chainId', hardhatConfig.networks[process.env.NETWORK!].chainId)

updateSigner(singer)
