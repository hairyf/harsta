import path from 'pathe'
import fs from 'fs-extra'
import type { Environment } from 'hardhat/internal/core/runtime-environment'
import { absolutePaths, packRoot } from '../../constants'

export async function ensureDirectories(env: Environment, clean?: boolean) {
  const generateRoot = path.resolve(packRoot, './generated')

  clean && await env.run('clean')

  await Promise.all([
    clean && fs.remove(path.resolve(generateRoot, './_fragments-factories')),
    clean && fs.remove(path.resolve(generateRoot, './_fragments-contracts')),
    clean && fs.remove(path.resolve(generateRoot, './_typechain-contracts')),
    clean && fs.remove(path.resolve(generateRoot, './_typechain-factories')),
    clean && fs.remove(path.resolve(generateRoot, './contracts')),
    clean && fs.remove(path.resolve(generateRoot, './factories')),
    clean && fs.remove(absolutePaths.packSources),
  ])

  const isExistsUserContracts = fs.existsSync(absolutePaths.userSources)

  if (isExistsUserContracts)
    await fs.copy(absolutePaths.userSources, absolutePaths.packSources)

  await Promise.all([
    fs.ensureDir(path.resolve(generateRoot, './_fragments-factories')),
    fs.ensureDir(path.resolve(generateRoot, './_fragments-contracts')),
    fs.ensureDir(path.resolve(generateRoot, './_typechain-contracts')),
    fs.ensureDir(path.resolve(generateRoot, './_typechain-factories')),
    fs.ensureDir(path.resolve(generateRoot, './contracts')),
    fs.ensureDir(path.resolve(generateRoot, './factories')),
  ])
}
