import fs from 'node:fs'
import path from 'pathe'
import { resolveImport } from 'resolve-import-path'

export function fixtureHardhat() {
  const hardhatFsUtilsFile = resolveImport('hardhat/internal/util/fs-utils.js')
  const hardhatHuUtilsFile = resolveImport('@noble/hashes/utils.js')

  if (!fs.existsSync(hardhatFsUtilsFile))
    return
  const fixFsUtilsContent = fs.readFileSync(hardhatFsUtilsFile, 'utf-8')
    .replace('throw new FileNotFoundError(absolutePath, e)', 'return absolutePath')
  fs.writeFileSync(hardhatFsUtilsFile, fixFsUtilsContent)

  const fixHuUtilsContent = fs.readFileSync(hardhatHuUtilsFile, 'utf-8')
    .replace('a instanceof Uint8Array', `typeof a.length === 'number'`)
  fs.writeFileSync(hardhatHuUtilsFile, fixHuUtilsContent)
}
