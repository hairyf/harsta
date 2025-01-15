import { formatEther as _formatEther } from 'ethers'
import type { Delimiter, Numberish } from '@hairy/format'
import { Bignumber, formatNumeric, numerfix, unum } from '@hairy/format'

export interface FormatEtherOptions {
  delimiters?: Delimiter[] | false
  separator?: boolean
  rounding?: Bignumber.RoundingMode
  decimals?: number
}

export function formatEther(value: Numberish = '0', options: FormatEtherOptions = {}) {
  const number = _formatEther(unum(numerfix(value)).toFixed(0))
  const separator = options.separator === false ? '' : undefined
  return formatNumeric(number, {
    format: { groupSeparator: separator },
    decimals: options.decimals,
    delimiters: options.delimiters,
    rounding: options.rounding,
  })
}

export { Bignumber }
