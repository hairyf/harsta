import path from 'pathe'
import { resolveImport } from 'resolve-import-path'

export const userRoot = process.env.userRoot || process.cwd().replace(/\\/g, '/')
export const clientJsonPath = resolveImport('@harsta/client/package.json', false, { basedir: userRoot })
export const clientRoot = process.env.clientRoot || (clientJsonPath ? path.dirname(clientJsonPath) : undefined)
export const packRoot = process.env.packRoot || path.dirname(resolveImport('harsta/package.json', true)!)
