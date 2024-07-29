import path from 'node:path'
import fs from 'fs-extra'
import { packRoot } from '../../constants'

export async function generateDeployDirectory(userConf: any) {
  const deployments = userConf.deployments || {}

  await fs.remove(path.resolve(packRoot, './deploy'))
  await fs.ensureDir(path.resolve(packRoot, './deploy'))

  for (const name in deployments) {
    const isUpdate = typeof deployments[name].update === 'string'
    const type = isUpdate ? deployments[name].update : undefined
    const code = [
      isUpdate
        ? `const { createUpdate } = require('harsta/runtime')`
        : `const { createDeploy } = require('harsta/runtime')`,
      '',
      isUpdate
        ? `module.exports = createUpdate('${name}', '${type}')`
        : `module.exports = createDeploy('${name}')`,
    ]

    const filepath = path.resolve(packRoot, './deploy', `${name}.js`)

    await fs.writeFile(filepath, code.join('\n'))
  }
}
