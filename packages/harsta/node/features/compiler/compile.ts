import type { Environment } from 'hardhat/internal/core/runtime-environment'
import fs from 'fs-extra'
import { userConf } from '../../constants'
import { ensureDirectories } from './ensures'
import { resolveFragmentsPaths } from './resolve'
import {
  generateAddresses,
  generateChains,
  generateContracts,
  generateContractsExtends,
  generateExtraTypeChain,
  generateFragments,
  generateTypes,
} from './generator'
import { buildDistributed } from './builder'
import { searchHasExtFiles } from './utils'

export interface CompileOptions {
  clean?: boolean
  output?: string
}

export async function compile(env: Environment, options: CompileOptions = {}) {
  await ensureDirectories(userConf)

  if (options.clean)
    await env.run('clean')

  await env.run('export-abi')

  await generateExtraTypeChain('./config/externally')

  const fragments = resolveFragmentsPaths()

  await Promise.all([
    generateAddresses(),
    generateChains(),
    generateFragments(fragments.sources),
    generateContracts(fragments.sources),
    generateContractsExtends(fragments.extends),
    generateTypes([...fragments.sources, ...fragments.extends]),
  ])

  await buildDistributed(options)
}
