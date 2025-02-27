import path from 'pathe'
import fs from 'fs-extra'
import { packRoot, userRoot } from '../../constants'

export async function ensureDirectories() {
  const generateRoot = path.resolve(packRoot, './generated')

  await Promise.all([
    fs.remove(path.resolve(generateRoot, './_fragments-factories')),
    fs.remove(path.resolve(generateRoot, './_fragments-contracts')),
    fs.remove(path.resolve(generateRoot, './_typechain-contracts')),
    fs.remove(path.resolve(generateRoot, './_typechain-factories')),
    fs.remove(path.resolve(generateRoot, './contracts')),
    fs.remove(path.resolve(generateRoot, './factories')),
    fs.remove(path.resolve(packRoot, './contracts')),
  ])

  await fs.ensureDir(path.resolve(userRoot, './contracts'))

  await fs.copy(
    path.resolve(userRoot, './contracts'),
    path.resolve(packRoot, './contracts'),
  )
}
