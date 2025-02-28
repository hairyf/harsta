import type { Argv } from 'yargs'
import { userRoot } from '../constants'
import features from '../features'
import { exec, getRuntimeRequiredNetwork, vitestBinRoot } from './utils'

export function registerTestCommand(cli: Argv) {
  cli.command(
    'test',
    'runs vitest tests',
    args => args
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
      .option('watch', {
        type: 'boolean',
        describe: 'Run all test suites but watch for changes and rerun tests when they change.',
      })
      .help(),
    async (args) => {
      const network = getRuntimeRequiredNetwork(args.network, args)

      if (network !== 'hardhat' && process.env.FORK)
        throw new Error(`${network} Not Support fork`)

      const env = features.environment.createEnvironment()
      await features.compiler.compile(env, { output: 'ONLY_COMPILE' })

      try {
        exec([
          `node ${vitestBinRoot}`,
          args.watch ? 'watch' : 'run',
          `--environment=node`,
          `-r ${userRoot}`,
        ])
      }
      catch {}
    },
  )
}
