import { formatEther as _formatEther } from 'ethers'
import type { Numberish } from '@hairy/format'
import { formatNumeric, numerfix, unum } from '@hairy/format'
import BigNumber from 'bignumber.js'

export function formatEther(value: Numberish = '0', decimalPlaces = 2, roundingMode = BigNumber.ROUND_DOWN) {
  const num = _formatEther(unum(numerfix(value)).toFixed(0))
  return formatNumeric(num, { d: decimalPlaces, r: roundingMode })
}
