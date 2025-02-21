import path from 'pathe'
import fs from 'fs-extra'
import { glob, runTypeChain } from 'typechain'
import { generatedRoot, userConf, userRoot } from '../../constants'
import type { Chain } from '../../types'
import { resolveUserPath } from '../../utils'
import { transformNetworkToChain } from '../../transform'
import type { ContractFragment } from './resolve'
import { resolveUserAddresses } from './resolve'
import { searchHasExtFiles } from './utils'

export async function generateAddresses() {
  const packAddressesPath = path.resolve(generatedRoot, './addresses/index.ts')
  const addresses = await resolveUserAddresses()
  await fs.ensureDir(path.dirname(packAddressesPath))
  await fs.writeFile(packAddressesPath, addresses)
}

export async function generateChains() {
  const chainsDir = path.resolve(generatedRoot, './chains')
  await fs.ensureDir(chainsDir)
  const indexRows: string[] = []
  indexRows.push(`import addresses from '../addresses'\n`)
  for (const alias in userConf.networks) {
    const network = userConf.networks[alias]
    const chain: Chain = transformNetworkToChain(network)
    indexRows.push(`export const ${alias} = { ...${JSON.stringify(chain)}, addresses: addresses[${network.id}] }as const\n`)
  }
  if (!indexRows.length)
    indexRows.push('export {}')
  await fs.writeFile(path.resolve(chainsDir, './index.ts'), indexRows.join('\n'))
}

export async function generateFragments(fragmentsPaths: ContractFragment[]) {
  const indexRows: string[] = []
  for (const { outfile, path } of fragmentsPaths) {
    indexRows.push(`export { default as ${outfile.name}Fragment } from './${path}'`)
  }
  !indexRows.length && indexRows.push('export {}')
  indexRows.push('')
  await fs.ensureDir(path.resolve(generatedRoot, './fragments'))
  const fragmentsPath = userConf.paths?.fragments || './config/fragments'
  await fs.copy(
    path.resolve(generatedRoot, './fragments'),
    resolveUserPath(fragmentsPath)!,
  )
  await fs.writeFile(path.resolve(path.resolve(generatedRoot, './fragments'), './index.ts'), indexRows.join('\n'))
}

export async function generateContracts(fragmentsPaths: ContractFragment[]) {
  await generateContractFactories(
    fragmentsPaths,
    path.resolve(generatedRoot, './contracts'),
    path.resolve(generatedRoot, './typechains'),
    ['', `export * from './extends'`],
  )
}

export async function generateContractsExtends(fragmentsPaths: ContractFragment[]) {
  if (!fragmentsPaths.length) {
    await fs.ensureDir(path.resolve(generatedRoot, './contracts/extends'))
    await fs.writeFile(path.resolve(generatedRoot, './contracts/extends/index.ts'), 'export {}\n')
    return
  }
  await generateContractFactories(
    fragmentsPaths,
    path.resolve(generatedRoot, './contracts/extends'),
    path.resolve(generatedRoot, './typechains/extends'),
  )
}
export async function generateExtraTypeChain(dirpath: string) {
  if (!searchHasExtFiles(path.join(userRoot, dirpath), '.json'))
    return
  const allFiles = glob(userRoot, [`${dirpath}/*.json`])
  const outDir = path.resolve(generatedRoot, './typechains/extends')
  await runTypeChain({
    filesToProcess: allFiles,
    target: 'ethers-v6',
    cwd: userRoot,
    outDir,
    allFiles,
  })

  const indexPath = path.join(generatedRoot, 'typechains/index.ts')
  if (!fs.existsSync(indexPath))
    fs.writeFile(indexPath, `export * from './extends'`)
}
export async function generateTypes(paths: ContractFragment[]) {
  const types = [
    {
      type: 'events',
      filter: (mod: string) => mod.endsWith('Event'),
      outfile: './events/index.ts',
    },
    {
      type: 'interfaces',
      filter: (mod: string) => mod.endsWith('Interface'),
      outfile: './interfaces/index.ts',
    },
    {
      type: 'instances',
      filter: (mod: string, name: string) => mod === name,
      outfile: './instances/index.ts',
    },
  ]

  const processes = types.map(async (config) => {
    const outfile = path.resolve(generatedRoot, config.outfile)
    const dirname = path.dirname(outfile)

    await fs.remove(dirname)
    await fs.ensureDir(dirname)

    function resolve({ input, outfile: { name } }: typeof paths[number]) {
      const exports = input.exports.filter(mod => config.filter(mod, name)) || []
      const importPath = `${path.relative(dirname, input.typechains)}/${input.relative}`
      return `export type { ${exports.join(', ')} } from '${importPath}'`
    }
    function resolveDefaultRows(rows: string[]) {
      !rows.length && rows.push('export {}')
    }
    if (config.type !== 'events') {
      const rows = paths.map(resolve)
      resolveDefaultRows(rows)
      await fs.writeFile(outfile, rows.join('\n'))
      return
    }
    for (const p of paths) {
      const outfile = path.resolve(dirname, `${p.outfile.name}.ts`)
      await fs.writeFile(outfile, resolve(p))
    }
    const indexRows = paths
      .map(p => p.outfile.name)
      .map(name => `export * as ${name} from './${name}'`)
    resolveDefaultRows(indexRows)
    await fs.writeFile(outfile, indexRows.join('\n'))
  })

  await Promise.all(processes)
}

async function generateContractFactories(
  paths: ContractFragment[],
  outdir: string,
  typechainsPath: string,
  suffixRows: string[] = [],
) {
  await fs.ensureDir(outdir)

  const indexRows: string[] = []

  for (const { outfile, input } of paths) {
    const { name, dirname, file } = outfile
    const factoryFile = await fs.readFile(input.factory, 'utf-8')
    const existBytes = factoryFile.includes('_bytecode')
    const fileRows = [
      `import { ${name}__factory } from '${path.relative(dirname, typechainsPath)}'`,
      `import * as resolver from '${path.relative(dirname, path.resolve(generatedRoot, './resolver'))}'`,
      `import { ${name}, ${name}Interface } from '${input.import}'`,
      `import type { Runner } from '${path.relative(dirname, path.resolve(generatedRoot, './types'))}'`,
      existBytes && `import type { Signer } from 'ethers'`,
      '',
      `export type { ${name}, ${name}Interface }`,
      '',
      `export class ${name}Factory {`,
      existBytes && `  static bytecode = ${name}__factory.bytecode`,
      `  static abi = ${name}__factory.abi`,
      '',
      `  static interface(): ${name}Interface {`,
      `    return ${name}__factory.createInterface()`,
      '  }',
      '',
      existBytes && '  static factory(signer?: Signer) {',
      existBytes && `    const resolvedSigner = signer || resolver.runner('signer')`,
      existBytes && `    return new ${name}__factory(resolvedSigner as Signer)`,
      existBytes && '  }',
      existBytes && '',
      `  static attach(address: string, runner?: Runner): ${name} {`,
      `    return ${name}__factory.connect(address, resolver.runner(runner))`,
      '  }',
      '',
      `  static resolve(runner?: Runner, address?: string): ${name} {`,
      `    const resolvedRunner = resolver.runner(runner)`,
      `    const target = address || resolver.address('${name}', resolvedRunner)`,
      `    return ${name}__factory.connect(target, resolvedRunner)`,
      `  }`,
      '}',
    ]
    await fs.ensureDir(dirname)
    await fs.writeFile(file, fileRows.filter(Boolean).join('\n'))
    const exportFile = file.replace('.ts', '')
    const exportPath = path.relative(outdir, exportFile)
    indexRows.push(`export { ${name}Factory as ${name} } from './${exportPath.replace(/\\/g, '/')}'`)
  }

  indexRows.push(...suffixRows)

  indexRows.push('')

  await fs.writeFile(path.resolve(outdir, './index.ts'), indexRows.join('\n'))
}
