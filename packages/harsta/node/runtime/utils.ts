import path from 'node:path'
import env from 'hardhat'
import { loadFile, writeFile } from 'magicast'
import consola from 'consola'
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
  const file = path.resolve(userRoot, './config/addresses.ts')
  const mod = await loadFile(file)
  mod.exports.default[await env.getChainId()][name] = address
  await writeFile(mod, file)
  consola.log(`Updated [${name}] Contract - ${address}`)
}

export async function upgradeStorage(name: string, md5: string) {
  await storage.setItem(`${await env.getChainId()}:${name}`, md5)
}
