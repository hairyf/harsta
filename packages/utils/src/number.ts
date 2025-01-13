import BigNumber from 'bignumber.js'
import { formatEther as _formatEther } from 'ethers'

export function numerfix(value: any) {
  const _isNaN = isNaN(Number(value)) || value.toString() === 'NaN'
  if (_isNaN)
    console.warn(`numerfix(${value}): value is not the correct value. To ensure the normal operation of the program, it will be converted to zero`)
  return (_isNaN) ? '0' : String(value)
}


export function formatEther(value: any = '0') {
  return _formatEther(new BigNumber(numerfix(value)).toFixed(0))
}