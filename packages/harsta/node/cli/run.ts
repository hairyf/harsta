/* eslint-disable no-restricted-globals */
import type { Argv } from 'yargs'
import features from '../features'
import { getRuntimeRequiredNetwork } from './utils'

export function registerRunCommand(cli: Argv) {
  cli.command(
    'run [file]',
    'run any file',
    args => args
      .positional('file', {
        type: 'string',
        describe: 'Run any javascript or typescript file',
      })
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'The harsta network used (default use of hardhat network)',
        default: 'hardhat',
      })
      .option('fork', {
        type: 'string',
        describe: 'The URL of the JSON-RPC server to fork from',
      })
      .option('forkBlockNumber', {
        type: 'number',
        describe: 'The block number to fork from',
      })
      .option('clean', {
        describe: 'Clears the cache and deletes all artifacts',
        alias: 'c',
        type: 'boolean',
      })
      .help(),
    async (args) => {
      const network = getRuntimeRequiredNetwork(args.network, args)

      if (network !== 'hardhat' && process.env.FORK)
        throw new Error(`${network} Not Support fork`)

      await features.environment.initial(args.network, args)
      await features.compiler.compile(
        features.environment.env,
        { output: 'ONLY_COMPILE' },
      )

      try {
        const injects = ['manager', 'network', 'provider', 'signer', 'env', 'runner'] as const

        Reflect.set(global, 'harsta', {})

        for (const key of injects) {
          const target = Reflect.get(global, 'harsta')
          const inject = features.environment[key]
          Reflect.set(target, key, inject)
        }
        // TODO RUN
      }
      catch { }
    },
  )
}
