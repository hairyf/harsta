/* eslint-disable ts/no-require-imports */
import path from 'pathe'
import { packRoot, relativePaths } from '../../constants'

export function resolveGeneratedFactory(name: string, target: string) {
  const factories = resolvePackageFile(`./generated/${relativePaths.generateFactoriesTypechainIndexTS}`)
  const Factory = factories[`${target}__factory`]

  if (!Factory)
    throw new Error(`Not found ${name}:${target}.sol factory please create ${target}.sol or recompile`)

  return Factory
}

export function resolvePackageFile<T = any>(filepath: string): T {
  return require('jiti')(__dirname)(path.resolve(packRoot, filepath))
}
