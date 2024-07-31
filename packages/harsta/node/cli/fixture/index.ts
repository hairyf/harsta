import fs from 'node:fs'
import { resolveImport } from 'resolve-import-path'

export function fixtureHardhat() {
  const hardhatFsUtilsFile = resolveImport('hardhat/internal/util/fs-utils.js')
  if (!fs.existsSync(hardhatFsUtilsFile))
    return
  const fixFsUtilsContent = fs.readFileSync(hardhatFsUtilsFile, 'utf-8')
    .replace('throw new FileNotFoundError(absolutePath, e)', 'return absolutePath')
  fs.writeFileSync(hardhatFsUtilsFile, fixFsUtilsContent)
}
