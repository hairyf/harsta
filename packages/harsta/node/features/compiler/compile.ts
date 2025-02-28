import type { Environment } from 'hardhat/internal/core/runtime-environment'
import { ensureDirectories } from './ensures'
import { resolveFragmentsPaths } from './resolve'
import {
  generateAddresses,
  generateChains,
  generateContracts,
  generateFactories,
  generateFragments,
  generateTypechain,
} from './generator'
import { buildDistributed } from './builder'

export interface CompileOptions {
  clean?: boolean
  output?: string
}

export async function compile(env: Environment, options: CompileOptions = {}) {
  await ensureDirectories(env, options.clean)

  await generateTypechain(env)

  const fragments = resolveFragmentsPaths()

  await Promise.all([
    generateChains(),
    generateAddresses(),
    generateFactories(fragments.factories),
    generateContracts(fragments.contracts),
    generateFragments(fragments.contracts),
  ])

  await buildDistributed(options)
}
