import path from 'pathe'
import fs from 'fs-extra'
import type { Environment } from 'hardhat/internal/core/runtime-environment'
import { packRoot, userRoot } from '../../constants'

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
    clean && fs.remove(path.resolve(packRoot, './contracts')),
  ])
  const isExistsUserContracts = fs.existsSync(path.resolve(userRoot, './contracts'))

  if (isExistsUserContracts)
    await fs.copy(path.resolve(userRoot, './contracts'), path.resolve(packRoot, './contracts'))

  await Promise.all([
    fs.ensureDir(path.resolve(generateRoot, './_fragments-factories')),
    fs.ensureDir(path.resolve(generateRoot, './_fragments-contracts')),
    fs.ensureDir(path.resolve(generateRoot, './_typechain-contracts')),
    fs.ensureDir(path.resolve(generateRoot, './_typechain-factories')),
    fs.ensureDir(path.resolve(generateRoot, './contracts')),
    fs.ensureDir(path.resolve(generateRoot, './factories')),
  ])
}
