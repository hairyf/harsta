import path from 'pathe'
import fs from 'fs-extra'
import consola from 'consola'
import { packRoot, userRoot } from '../../constants'
import { findDepthFilePaths } from '../../utils'

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

export function resolveFragmentsPaths() {
  const generateRoot = path.resolve(packRoot, './generated')

  const fragmentsExtendsPaths = findDepthFilePaths(path.resolve(userRoot, './config/fragments'))
  const fragmentsPaths = findDepthFilePaths(path.resolve(generateRoot, './fragments'))
    .filter(p => !p.endsWith('index.ts'))
    .filter(p => !fragmentsExtendsPaths.some(ep => path.basename(p) === path.basename(ep)))

  function resolveFile(p: string, typechainsPath: string) {
    if (!p.includes('.sol')) {
      return p.split('.json')[0]
    }
    const file = path.resolve(
      typechainsPath,
        `${p.split('.sol')[0]}.sol`,
    )
    return fs.existsSync(file)
      ? p.split('.json')[0]
      : p.split('.sol')[0]
  }
  function input(p: string, typechainsPath: string, outfile: any) {
    const relativeFile = resolveFile(p, typechainsPath)
    const file = `${path.resolve(typechainsPath, relativeFile)}.ts`
    const importPath = `${path.relative(outfile.dirname, typechainsPath)}/${relativeFile}`
    consola.log('----------', fs.readdirSync(typechainsPath))
    const content = fs.readFileSync(file, 'utf-8')
    const regExps = [
      /export declare namespace (.*?) \{/gs,
      /export interface (.*?) extends Interface \{/gs,
      /export namespace (.*?) \{/gs,
    ]

    const exports = regExps
      .map(reg => [...content.matchAll(reg)].map(mat => mat[1]))
      .flatMap(mod => mod)

    if (!exports.includes(outfile.name)) {
      exports.push(outfile.name)
    }

    return {
      import: importPath,
      relative: relativeFile,
      typechains: typechainsPath,
      exports,
      file,
    }
  }
  function outfile(p: string, outdir: string) {
    const name = path.basename(p).replace('.json', '')
    const file = path.resolve(outdir, p).replace('.json', '.ts')
    const dirname = path.dirname(file)
    return { dirname, file, name }
  }

  return [
    fragmentsPaths.map((fPath) => {
      const _outfile = outfile(fPath, path.resolve(path.resolve(generateRoot, './contracts')))
      return {
        path: fPath,
        input: input(fPath, path.resolve(path.resolve(generateRoot, './typechains')), _outfile),
        outfile: _outfile,
      }
    }),
    fragmentsExtendsPaths.map((fPath) => {
      const _outfile = outfile(fPath, path.resolve(path.resolve(generateRoot, './contracts/extends')))
      return {
        path: fPath,
        input: input(fPath, path.resolve(path.resolve(generateRoot, './typechains/extends')), _outfile),
        outfile: _outfile,
      }
    }),

  ] as const
}
