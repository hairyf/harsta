import path from 'node:path'
import fs from 'fs-extra'
import { userRoot } from 'node/constants'

export async function resolveUserAddresses() {
  const userAddressesPath = path.resolve(userRoot, './config/addresses.ts')
  const addrFile = path.resolve(userRoot, './config/addresses.ts')
  const jsonFile = path.resolve(userRoot, './config/addresses.json')
  if (fs.existsSync(jsonFile))
    return `export default ${await fs.readFile(jsonFile, 'utf-8')}`
  if (fs.existsSync(addrFile))
    return fs.readFile(addrFile, 'utf-8')
  const defaultFileContent = 'export default {\n\n}\n'
  await fs.ensureDir(path.dirname(userAddressesPath))
  await fs.writeFile(userAddressesPath, defaultFileContent)
  return defaultFileContent
}
