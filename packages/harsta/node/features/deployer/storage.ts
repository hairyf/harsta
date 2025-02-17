import path from 'node:path'
import fs from 'fs-extra'
import { loadFile, writeFile } from 'magicast'
import { userRoot } from '../../constants'
import { network } from '../environment'

export async function getAddresses() {
  const addrFile = path.resolve(userRoot, './config/addresses.ts')
  const jsonFile = path.resolve(userRoot, './config/addresses.json')

  if (fs.existsSync(addrFile))
    return loadFile(addrFile).then(mod => mod.exports.default)

  if (fs.existsSync(jsonFile))
    return fs.readJSON(jsonFile).then(mod => mod)
}

export async function getAddress(name: string): Promise<string | undefined> {
  return getAddresses().then(mod => mod?.[network.id]?.[name])
}

export async function setAddress(name: string, address: string) {
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

export async function getDeployed(name: string) {
  const dirPath = path.resolve(`${userRoot}/config/deployments`, network.alias)
  const filePath = path.resolve(dirPath, `${name}.json`)
  if (!fs.existsSync(filePath)) {
    return
  }

  return fs.readJSON(filePath)
}

export async function setDeployed(name: string, deployed: any) {
  const dirPath = path.resolve(`${userRoot}/config/deployments`, network.alias)
  const filePath = path.resolve(dirPath, `${name}.json`)
  await fs.ensureDir(dirPath)
  await fs.writeJSON(filePath, deployed, { spaces: 2 })
}
