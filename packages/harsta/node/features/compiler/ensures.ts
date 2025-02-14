import path from 'pathe'
import fs from 'fs-extra'
import { packRoot, userRoot } from '../../constants'
import { resolveUserPath } from '../../utils'
import type { HarstaUserConfig } from '../../types'

export async function ensureDirectories(config: HarstaUserConfig) {
  const generateRoot = path.resolve(packRoot, './generated')
  await Promise.all([
    fs.remove(path.resolve(packRoot, './contracts')),
    fs.remove(path.resolve(generateRoot, './contracts')),
    fs.remove(path.resolve(generateRoot, './fragments')),
  ])

  if (config.paths?.fragments) {
    await fs.remove(path.join(resolveUserPath(config.paths.fragments)!, './@openzeppelin'))
    await fs.remove(path.join(resolveUserPath(config.paths.fragments)!, './contracts'))
  }

  await fs.ensureDir(path.resolve(userRoot, './contracts'))
  await fs.copy(
    path.resolve(userRoot, './contracts'),
    path.resolve(packRoot, './contracts'),
  )
}
