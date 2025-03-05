import path from 'pathe'
import fs from 'fs-extra'
import { absolutePaths } from '../../constants'
import { environment } from '../imports'

export function exists(name: string) {
  const directory = path.resolve(absolutePaths.harstaDeployments, environment.network.alias)
  const file = path.resolve(directory, `${name}.json`)
  return fs.existsSync(file)
}
