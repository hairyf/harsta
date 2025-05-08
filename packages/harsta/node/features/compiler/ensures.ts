import path from 'pathe'
import fs from 'fs-extra'
import type { Environment } from 'hardhat/internal/core/runtime-environment'
import { absolutePaths, packRoot } from '../../constants'

export async function ensureDirectories(env: Environment, clean?: boolean) {
  clean && await env.run('clean')

  await Promise.all([
    clean && fs.remove(absolutePaths.generateFactoriesFragments),
    clean && fs.remove(absolutePaths.generateContractsFragments),
    clean && fs.remove(absolutePaths.generateFactoriesTypechain),
    clean && fs.remove(absolutePaths.generateContractsTypechain),
    clean && fs.remove(absolutePaths.generateFactories),
    clean && fs.remove(absolutePaths.generateContracts),
    clean && fs.remove(absolutePaths.packSources),
  ])

  const isExistsUserContracts = fs.existsSync(absolutePaths.userSources)

  if (isExistsUserContracts)
    await fs.copy(absolutePaths.userSources, absolutePaths.packSources)

  await Promise.all([
    fs.ensureDir(absolutePaths.generateFactoriesFragments),
    fs.ensureDir(absolutePaths.generateContractsFragments),
    fs.ensureDir(absolutePaths.generateFactoriesTypechain),
    fs.ensureDir(absolutePaths.generateContractsTypechain),
    fs.ensureDir(absolutePaths.generateFactories),
    fs.ensureDir(absolutePaths.generateContracts),
  ])
}
