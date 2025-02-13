import path from 'node:path'
import fs from 'fs-extra'
import { packRoot, userRoot } from '../../constants'

export async function generateDeployDirectory(userConf: any) {
  const deployments = userConf.deployments || {}

  await fs.remove(path.resolve(packRoot, './deploy'))
  await fs.ensureDir(path.resolve(packRoot, './deploy'))

  for (const name in deployments) {
    const isUpdate = typeof deployments[name].kind === 'string'
    const type = isUpdate ? deployments[name].kind : undefined
    const code = [
      isUpdate
        ? `const { createDeployInUpdate } = require('harsta/deploy')`
        : `const { createDeploy } = require('harsta/deploy')`,
      '',
      isUpdate
        ? `module.exports = createDeployInUpdate('${name}', '${type}')`
        : `module.exports = createDeploy('${name}')`,
    ]

    const filepath = path.resolve(packRoot, './deploy', `${name}.js`)

    await fs.writeFile(filepath, code.join('\n'))
  }
}

export async function generateUpdateDirectory(name: string, target: string) {
  await fs.remove(path.resolve(packRoot, './deploy'))
  await fs.ensureDir(path.resolve(packRoot, './deploy'))
  const filepath = path.resolve(packRoot, './deploy', `${name}.js`)
  const code = [
    `const { createUpdate } = require('harsta/deploy')`,
    `module.exports = createUpdate('${name}', '${target}')`,
  ]
  await fs.writeFile(filepath, code.join('\n'))
}

export async function generateEnsureFiles() {
  await fs.remove(path.resolve(packRoot, './contracts'))
  await fs.copy(
    path.resolve(userRoot, './contracts'),
    path.resolve(packRoot, './contracts'),
  )
}
