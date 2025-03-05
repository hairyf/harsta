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

  fs.existsSync(path.resolve(userRoot, './contracts')) && await fs.copy(
    path.resolve(userRoot, './contracts'),
    path.resolve(packRoot, './contracts'),
  )
  await fs.ensureDir(path.resolve(packRoot, './contracts'))
}
