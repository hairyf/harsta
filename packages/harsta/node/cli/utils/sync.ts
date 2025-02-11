import path from 'node:path'
import fs from 'fs-extra'
import { packRoot, userRoot } from '../../constants'

export async function ensureGenerateFiles() {
  const generateRoot = path.resolve(packRoot, './generated')

  await fs.remove(path.resolve(packRoot, './contracts'))
  await fs.copy(
    path.resolve(userRoot, './contracts'),
    path.resolve(packRoot, './contracts'),
  )

  await fs.ensureDir(path.resolve(generateRoot, './contracts'))
  await fs.ensureDir(path.resolve(generateRoot, './fragments'))

  await fs.writeFile(path.resolve(generateRoot, './contracts/index.ts'), 'export {}')
  await fs.writeFile(path.resolve(generateRoot, './fragments/index.ts'), 'export {}')
}
