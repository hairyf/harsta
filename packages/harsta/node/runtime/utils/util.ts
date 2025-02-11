/* eslint-disable ts/no-require-imports */
import path from 'node:path'
import { packRoot } from '../../constants'

export function resolveInPackFile<T = any>(filepath: string): T {
  return require('jiti')(__dirname)(path.resolve(packRoot, filepath))
}

export function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time))
}
