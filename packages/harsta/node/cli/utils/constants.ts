import path from 'node:path'
import { resolveImport } from 'resolve-import-path'
import fs from 'fs-extra'

export const hardhatBinRoot = (() => {
  const packagePath = resolveImport('hardhat/package.json')
  const root = path.dirname(packagePath)
  const json = fs.readJsonSync(packagePath)
  return path.join(root, json.bin.hardhat)
})()

export const ptsupBinRoot = (() => {
  const packagePath = resolveImport('ptsup/package.json')
  const root = path.dirname(packagePath)
  const json = fs.readJsonSync(packagePath)
  return path.join(root, json.bin.ptsup)
})()
