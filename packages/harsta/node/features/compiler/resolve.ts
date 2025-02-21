import path from 'pathe'
import fs from 'fs-extra'
import { packRoot, userRoot } from '../../constants'
import { findDepthFilePaths } from '../../utils'

export interface ContractFragment {
  path: string
  input: {
    import: string
    relative: string
    typechains: string
    factory: string
    exports: string[]
    file: string
  }
  outfile: {
    dirname: string
    file: string
    name: string
  }
}

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
  const fragmentsPaths = findDepthFilePaths(path.resolve(generateRoot, './fragments'))
  const fragmentsExtendsPaths = findDepthFilePaths(path.resolve(userRoot, './config/externally'))
    .filter(p => !p.endsWith('index.ts'))
    .filter(p => !fragmentsPaths.some(ep => path.basename(p) === path.basename(ep)))

  return {
    sources: generateFragmentData(fragmentsPaths, generateRoot, './contracts') as ContractFragment[],
    extends: generateFragmentData(fragmentsExtendsPaths, generateRoot, './contracts/extends', true) as ContractFragment[],
  }
}

function generateFragmentData(fragments: string[], generateRoot: string, contractsDir: string, isExtended = false) {
  return fragments.map((fPath: string) => {
    const outDir = path.resolve(generateRoot, contractsDir)
    const _outfile = outfile(fPath, outDir)
    const typechainsPath = path.resolve(
      generateRoot,
      isExtended
        ? './typechains/extends'
        : './typechains',
    )
    return {
      path: fPath,
      input: input(fPath, typechainsPath, _outfile),
      outfile: _outfile,
    }
  })
}

function input(p: string, typechainsPath: string, outfile: any) {
  const relativeFile = getRelativeFilePath(p, typechainsPath)
  const file = `${path.resolve(typechainsPath, relativeFile)}.ts`
  const importPath = `${path.relative(outfile.dirname, typechainsPath)}/${relativeFile}`
  const factoryPath = `${typechainsPath}/factories/${relativeFile}__factory.ts`
  const content = fs.readFileSync(file, 'utf-8')

  const exports = extractExports(content, outfile.name)

  return {
    import: importPath,
    relative: relativeFile,
    typechains: typechainsPath,
    factory: factoryPath,
    exports,
    file,
  }
}

function getRelativeFilePath(p: string, typechainsPath: string) {
  if (p.includes('.sol')) {
    const file = path.resolve(typechainsPath, `${p.split('.sol')[0]}.sol`)
    return fs.existsSync(file) ? p.split('.json')[0] : p.split('.sol')[0]
  }
  return p.split('.json')[0]
}

function extractExports(content: string, outfileName: string) {
  const regExps = [
    /export declare namespace (.*?) \{/gs,
    /export interface (.*?) extends Interface \{/gs,
    /export namespace (.*?) \{/gs,
  ]

  const exports = regExps
    .flatMap(reg => [...content.matchAll(reg)].map(mat => mat[1]))

  if (!exports.includes(outfileName)) {
    exports.push(outfileName)
  }

  return exports
}

function outfile(p: string, outdir: string) {
  const name = path.basename(p).replace('.json', '')
  const file = path.resolve(outdir, p).replace('.json', '.ts')
  const dirname = path.dirname(file)
  return { dirname, file, name }
}
