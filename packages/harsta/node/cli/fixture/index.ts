/* eslint-disable no-extend-native */
/* eslint-disable ts/ban-ts-comment */
import fs from 'node:fs'
import { resolveImport } from 'resolve-import-path'

export function fixtureHardhatAndBigInt() {
  const hardhatFsUtilsFile = resolveImport('hardhat/internal/util/fs-utils.js')

  // @ts-expect-error
  BigInt.prototype.toJSON = function (this) {
    return this.toString()
  }

  if (!fs.existsSync(hardhatFsUtilsFile))
    return
  const fixFsUtilsContent = fs.readFileSync(hardhatFsUtilsFile, 'utf-8')
    .replace('throw new FileNotFoundError(absolutePath, e)', 'return absolutePath')

  fs.writeFileSync(hardhatFsUtilsFile, fixFsUtilsContent)
}
