import path from 'pathe'
import fs from 'fs-extra'
import { userRoot } from '../../constants'
import { environment } from '../imports'

export function exists(name: string) {
  const directory = path.resolve(`${userRoot}/config/deployments`, environment.network.alias)
  const file = path.resolve(directory, `${name}.json`)
  return fs.existsSync(file)
}
