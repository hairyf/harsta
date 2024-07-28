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
        ? `import { createUpdate } from 'harsta/runtime'`
        : `import { createDeploy } from 'harsta/runtime'`,
      '',
      isUpdate
        ? `export default createUpdate('${name}', '${type}')`
        : `export default createDeploy('${name}')`,
    ]

    const filepath = path.resolve(packRoot, './deploy', `${name}.ts`)

    await fs.writeFile(filepath, code.join('\n'))
  }
}
