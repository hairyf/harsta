import path from 'node:path'
import fs from 'fs-extra'
import consola from 'consola'
import { loadFile, writeFile } from 'magicast'
import { userRoot } from '../../constants'
import { getChainId } from './ethers'

export async function resolveAddress(name: string) {
  const addrFile = path.resolve(userRoot, './config/addresses.ts')
  const jsonFile = path.resolve(userRoot, './config/addresses.json')
  const chain = await getChainId()
  if (fs.existsSync(addrFile)) {
    const mod = await loadFile(addrFile)
    return mod.exports.default?.[chain]?.[name]
  }
  if (fs.existsSync(jsonFile)) {
    const mod = await fs.readJSON(jsonFile)
    return mod?.[chain]?.[name]
  }
}

export async function upgradeToAddress(name: string, address: string) {
  const addrFile = path.resolve(userRoot, './config/addresses.ts')
  const jsonFile = path.resolve(userRoot, './config/addresses.json')

  const chain = await getChainId()
  if (fs.existsSync(addrFile)) {
    const mod = await loadFile(addrFile)
    mod.exports.default ??= {}
    mod.exports.default[chain] ??= {}
    mod.exports.default[chain][name] = address
    await writeFile(mod, addrFile)
  }

  if (fs.existsSync(jsonFile)) {
    const mod = await fs.readJSON(jsonFile)
    mod[chain] ??= {}
    mod[chain][name] = address
    await fs.writeJson(jsonFile, mod, { spaces: 2 })
  }
}

export async function resolveInDeplJson(name: string) {
  const dirPath = path.resolve(`${userRoot}/config/deployments`, process.env.NETWORK || '')
  const filePath = path.resolve(dirPath, `${name}.json`)
  if (!fs.existsSync(filePath)) {
    consola.warn(`${name} not been deployed, please deploy first`)
    return
  }
  await fs.ensureDir(dirPath)
  return fs.readJSON(filePath)
}
export async function upgradeToDeplJson(name: string, deployed: any) {
  const dirPath = path.resolve(`${userRoot}/config/deployments`, process.env.NETWORK || '')
  const filePath = path.resolve(dirPath, `${name}.json`)
  await fs.ensureDir(dirPath)
  await fs.writeJSON(filePath, deployed, { spaces: 2 })
}
