import path from 'node:path'
import fs from 'fs-extra'
import consola from 'consola'
import { loadFile, writeFile } from 'magicast'
import { network, userRoot } from '../../constants'

export async function resolveInAddress(name: string) {
  const addrFile = path.resolve(userRoot, './config/addresses.ts')
  const jsonFile = path.resolve(userRoot, './config/addresses.json')

  if (fs.existsSync(addrFile))
    return loadFile(addrFile).then(mod => mod.exports.default?.[network.id]?.[name])

  if (fs.existsSync(jsonFile))
    return fs.readJSON(jsonFile).then(mod => mod?.[network.id]?.[name])
}

export async function upgradeToAddress(name: string, address: string) {
  const addrFile = path.resolve(userRoot, './config/addresses.ts')
  const jsonFile = path.resolve(userRoot, './config/addresses.json')

  if (fs.existsSync(addrFile)) {
    const mod = await loadFile(addrFile)
    mod.exports.default ??= {}
    mod.exports.default[network.id] ??= {}
    mod.exports.default[network.id][name] = address
    await writeFile(mod, addrFile)
  }

  if (fs.existsSync(jsonFile)) {
    const mod = await fs.readJSON(jsonFile)
    mod[network.id] ??= {}
    mod[network.id][name] = address
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
