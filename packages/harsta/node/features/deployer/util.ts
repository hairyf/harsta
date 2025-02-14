/* eslint-disable ts/no-require-imports */
import path from 'pathe'
import { packRoot } from '../../constants'

export function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time))
}
export function resolvePackageFile<T = any>(filepath: string): T {
  return require('jiti')(__dirname)(path.resolve(packRoot, filepath))
}
