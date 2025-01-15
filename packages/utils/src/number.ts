import { formatEther as _formatEther } from 'ethers'
import type { Delimiter, Numberish } from '@hairy/utils'
import { Bignumber, formatNumeric, numerfix, unum } from '@hairy/utils'

export interface FormatEtherOptions {
  delimiters?: Delimiter[] | false
  separator?: boolean
  rounding?: Bignumber.RoundingMode
  decimals?: number
  format?: Bignumber.Format
}

export function formatEther(value: Numberish = '0', options: FormatEtherOptions = {}) {
  const { separator = false, decimals, delimiters, rounding } = options
  const number = _formatEther(unum(numerfix(value)).toFixed(0))
  const groupSeparator = separator === false ? '' : undefined
  return formatNumeric(number, {
    format: { groupSeparator, ...options.format },
    decimals,
    delimiters,
    rounding,
  })
}

export { Bignumber }
