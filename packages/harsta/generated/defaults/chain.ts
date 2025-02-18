/* eslint-disable ts/ban-ts-comment */
import * as chains from '../chains'
import type { Chain } from '../types'
import { getter, proxy } from '../utils'
import { ALIAS_ENV, ALIAS_FIRST } from './constants'

const _p_chain = proxy<typeof chains[keyof typeof chains]>(chains[ALIAS_ENV!] || chains[ALIAS_FIRST])

export const chain = _p_chain.proxy
export const updateChain = _p_chain.update as (chain: Chain) => void

/**
 * @deprecated please use `chain.addresses`
 */
// @ts-expect-error
export const defaultAddresses = getter(() => _p_chain.proxy.addresses)
