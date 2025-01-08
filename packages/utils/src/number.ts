import BigNumber from 'bignumber.js'

import { formatEther as _formatEther } from 'ethers'
import { isBoolean } from './util'

export const BIG_INTS = {
  t: { v: 10 ** 12, d: 13, n: 't' },
  b: { v: 10 ** 9, d: 10, n: 'b' },
  m: { v: 10 ** 6, d: 7, n: 'm' },
  k: { v: 10 ** 3, d: 4, n: 'k' },
}

export interface DecimalOptions {
  d?: number
  r?: BigNumber.RoundingMode
}

export type Numeric = string | number | bigint | BigNumber.Instance
export type Delimiter = 'k' | 'm' | 'b' | 't'


export function unum(num: Numeric = '0') {
  return new BigNumber(typeof num === 'bigint' ? num.toString() : num)
}

export function percentage(total: Numeric, count: Numeric, options?: DecimalOptions) {
  options ??= { d: 3, r: BigNumber.ROUND_DOWN }
  if (unum(total).lte(0) || unum(count).lte(0))
    return '0'
  return unum(count)
    .div(total || '0')
    .times(100)
    .toFixed(options.d, options.r)
}

export function plus(array: Numeric[], options?: DecimalOptions): string {
  options ??= { d: 0, r: BigNumber.ROUND_DOWN }
  return array
    .filter(v => unum(v).gt(0))
    .reduce((t, v) => t.plus(v), unum(0))
    .toFixed(options.d, options.r)
}

export function average(array: Numeric[], options?: DecimalOptions) {
  options ??= { d: 0, r: BigNumber.ROUND_DOWN }
  if (array.length === 0)
    return '0'
  return unum(plus(array))
    .div(array.length)
    .toFixed(options.d, options.r)
}

export function gte(num: Numeric, n: Numeric) {
  return unum(num).gte(n)
}

export function gt(num: Numeric, n: Numeric) {
  return unum(num).gt(n)
}

export function lte(num: Numeric, n: Numeric) {
  return unum(num).lte(n)
}

export function lt(num: Numeric, n: Numeric) {
  return unum(num).lt(n)
}

export function parseNumeric(num: Numeric, delimiters: Delimiter[] = ['t', 'b', 'm']) {
  const mappings = [
    delimiters.includes('t') && ((n: BigNumber.Value) => gte(n, BIG_INTS.t.v) && BIG_INTS.t),
    delimiters.includes('b') && ((n: BigNumber.Value) => gte(n, BIG_INTS.b.v) && lt(n, BIG_INTS.t.v) && BIG_INTS.b),
    delimiters.includes('m') && ((n: BigNumber.Value) => gte(n, BIG_INTS.m.v) && lt(n, BIG_INTS.b.v) && BIG_INTS.m),
    delimiters.includes('k') && ((n: BigNumber.Value) => gte(n, BIG_INTS.k.v) && lt(n, BIG_INTS.m.v) && BIG_INTS.k),
  ]
  let options: { v: number, d: number, n: string } | undefined
  for (const analy of mappings) {
    const opts = analy && analy(unum(num).toFixed(0))
    opts && (options = opts)
  }
  return options || { v: 1, d: 0, n: '' }
}

export function formatEther(num: Numeric, delimiter: boolean | Delimiter[] = false, options?: DecimalOptions) {
  options ??= { d: 3, r: BigNumber.ROUND_DOWN }
  let wei = unum(num).toString()
  wei = wei === 'NaN'? '0' : wei
  if (delimiter) {
    isBoolean(delimiter) && (delimiter = ['t', 'b','m'])
    const config = parseNumeric(wei, delimiter)
    const number = unum(wei).div(config.v).toFormat(options.d, options.r)
    return `${number}${config.n}`
  }
  return _formatEther(wei)
}
