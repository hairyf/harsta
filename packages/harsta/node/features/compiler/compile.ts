import path from 'node:path'
import { glob, runTypeChain } from 'typechain'
import { generatedRoot, userConf, userRoot } from '../../constants'
import { createEnvironment } from '../environment'
import { ensureDirectories } from './ensures'
import { resolveFragmentsPaths } from './resolve'
import {
  generateAddresses,
  generateChains,
  generateContracts,
  generateContractsExtends,
  generateFragments,
  generateTypes,
} from './generator'
import { buildDistributed } from './builder'

export async function compile(args: any) {
  const env = createEnvironment()

  await ensureDirectories(userConf)

  if (args.clean)
    await env.run('clean')

  await env.run('export-abi')

  const fragments = resolveFragmentsPaths()

  if (fragments.extends.length) {
    const allFiles = glob(userRoot, ['./config/fragments/*.json'])
    const outDir = path.resolve(generatedRoot, './typechains/extends')
    await runTypeChain({
      filesToProcess: allFiles,
      target: 'ethers-v6',
      cwd: userRoot,
      outDir,
      allFiles,
    })
  }

  await Promise.all([
    generateAddresses(),
    generateChains(),
    generateFragments(fragments.sources),
    generateContracts(fragments.sources),
    generateContractsExtends(fragments.extends),
    generateTypes([...fragments.sources, ...fragments.extends]),
  ])

  await buildDistributed(args)
}
