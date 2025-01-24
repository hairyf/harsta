/* eslint-disable node/prefer-global/buffer */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { userRoot } from '../constants'
import { findFuzzyDepthFilePaths } from './file'
import { storage } from './storage'

export function fileMd5(filepath: string, offset = 0, length = 1024) {
  return new Promise<string>((resolve, reject) => {
    const md5sum = crypto.createHash('md5')
    if (!fs.existsSync(filepath)) {
      reject(new Error('The File is not existed!!!'))
    }
    fs.open(filepath, 'r', (err, fd) => {
      if (err) {
        reject(err)
      }
      const buf = Buffer.alloc(length)
      fs.readSync(fd, buf, 0, length, offset)
      md5sum.update(buf)
      const md5str = md5sum.digest('hex').toUpperCase()
      resolve(md5str)
    })
  })
}

export async function compare(
  name: string,
  chainId: string | number,
  cwd = path.resolve(userRoot, './contracts'),
) {
  const file = findFuzzyDepthFilePaths(cwd, name).at(-1)
  if (!file)
    throw new Error('Contract file not found')
  const nextName = path.basename(file).replace('.sol', '')
  const nextMd5 = await fileMd5(file)
  const prevMd5 = await storage.getItem<string>(`${chainId}:${nextName}`)

  process.env.NEXT_CONTRACT_MD5 = nextMd5

  return {
    updated: !prevMd5 || prevMd5 !== nextMd5,
    name: nextName,
    nextMd5,
    prevMd5,
  }
}
