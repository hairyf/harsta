import path from 'node:path'
import env from 'hardhat'
import { loadFile, writeFile } from 'magicast'
import consola from 'consola'
import fs from 'fs-extra'
import { userConf, userRoot } from '../constants'
import { storage } from '../utils'

export async function args(name: string) {
  const deployments = userConf.deployments || {}
  if (!deployments[name] || !deployments[name].args)
    return []
  if (Array.isArray(deployments[name].args))
    return deployments[name].args
  return deployments[name].args(env)
}

export async function upgradeAddress(name: string, address: string) {
  const addrFile = path.resolve(userRoot, './config/addresses.ts')
  const jsonFile = path.resolve(userRoot, './config/addresses.json')

  const chain = await env.getChainId()
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

  consola.log(`Updated [${name}] Contract - ${address}`)
}

export async function upgradeStorage(name: string, md5: string) {
  await storage.setItem(`${await env.getChainId()}:${name}`, md5)
}
