import path from 'pathe'
import fs from 'fs-extra'
import { glob, runTypeChain } from 'typechain'
import type { Environment } from 'hardhat/internal/core/runtime-environment'
import type { Chain } from '../../types'
import { transformNetworkToChain } from '../../transform'
import {
  absolutePaths,
  generatedRoot,
  relativePaths,
  userConf,
  userRoot,
} from '../../constants'
import type { ContractFragment } from './resolve'
import { resolveUserAddresses } from './resolve'
import { searchHasExtFiles } from './utils'

export async function generateAddresses() {
  const addresses = await resolveUserAddresses()
  await fs.ensureDir(absolutePaths.generateAddresses)
  await fs.writeFile(absolutePaths.generateAddressesIndexTS, addresses)
}

export async function generateChains() {
  await fs.ensureDir(absolutePaths.generateChains)

  const indexRowsPrefix = [`import addresses from '../addresses'\n`]
  const indexRows: string[] = []
  for (const alias in userConf.networks) {
    const network = userConf.networks[alias]
    const chain: Chain = transformNetworkToChain(network)
    indexRows.push(`export const ${alias} = { ...${JSON.stringify(chain)}, addresses: addresses[${network.id}] }as const\n`)
  }
  if (!indexRows.length)
    indexRows.push('export {}')

  indexRows.unshift(...indexRowsPrefix)

  await fs.writeFile(absolutePaths.generateChainsIndexTS, indexRows.join('\n'))
}

export async function generateFragments(fragmentsPaths: ContractFragment[]) {
  const indexRows: string[] = []
  for (const { outfile, path } of fragmentsPaths) {
    indexRows.push(`export { default as ${outfile.name}Fragment } from './${path}'`)
  }
  !indexRows.length && indexRows.push('export {}')
  indexRows.push('')

  await fs.ensureDir(absolutePaths.generateContractsFragments)
  await fs.copy(
    absolutePaths.generateFactoriesFragments,
    absolutePaths.harstaFragments,
  )

  await fs.writeFile(
    path.resolve(absolutePaths.generateContractsFragments, './index.ts'),
    indexRows.join('\n'),
  )
}

export async function generateFactories(fragmentsPaths: ContractFragment[]) {
  await generateConstructs(
    fragmentsPaths,
    absolutePaths.generateFactories,
    absolutePaths.generateFactoriesTypechain,
  )
}

export async function generateContracts(fragmentsPaths: ContractFragment[]) {
  await generateConstructs(
    fragmentsPaths,
    absolutePaths.generateContracts,
    absolutePaths.generateContractsTypechain,
  )
}

export async function generateTypechain(env: Environment) {
  await env.run('export-abi')

  if (!fs.existsSync(absolutePaths.generateFactoriesTypechainIndexTS)) {
    await fs.ensureDir(absolutePaths.generateFactoriesTypechain)
    await fs.ensureDir(absolutePaths.generateFactoriesFragments)
    await fs.writeFile(absolutePaths.generateFactoriesTypechainIndexTS, 'export {}')
  }

  await fs.remove(absolutePaths.generateContractsFragments)
  await fs.ensureDir(absolutePaths.generateContractsFragments)

  if (await searchHasExtFiles(absolutePaths.userFragments, '.json')) {
    await fs.copy(
      absolutePaths.userFragments,
      path.join(absolutePaths.generateContractsFragments, './externally'),
    )
  }

  await fs.copy(
    absolutePaths.generateFactoriesFragments,
    absolutePaths.generateContractsFragments,
  )

  const allFiles = glob(generatedRoot, [`${relativePaths.generateContractsFragments}/**/*.json`])
  const outDir = path.resolve(generatedRoot, relativePaths.generateContractsTypechain)

  await runTypeChain({
    inputDir: absolutePaths.generateContractsFragments,
    filesToProcess: allFiles,
    target: 'ethers-v6',
    cwd: userRoot,
    outDir,
    allFiles,
  })
  if (!fs.existsSync(absolutePaths.generateContractsTypechainIndexTS)) {
    await fs.ensureDir(absolutePaths.generateContractsTypechain)
    await fs.writeFile(absolutePaths.generateContractsTypechainIndexTS, 'export {}')
  }
}

export async function generateConstructs(
  paths: ContractFragment[],
  outdir: string,
  typechainsPath: string,
) {
  await fs.ensureDir(outdir)

  const rows: string[] = []

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
    rows.push(`export { ${name}Factory as ${name} } from './${exportPath.replace(/\\/g, '/')}'`)
  }

  !rows.length && rows.push('export {}')

  rows.push('')

  await fs.writeFile(path.resolve(outdir, './index.ts'), rows.join('\n'))
}
