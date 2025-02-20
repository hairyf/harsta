import type { Argv } from 'yargs'
import { userRoot } from '../constants'
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
        deprecate: 'The URL of the JSON-RPC server to fork from',
      })
      .option('watch', {
        type: 'boolean',
        deprecate: 'Run all test suites but watch for changes and rerun tests when they change.',
      })
      .option('forkBlockNumber', {
        type: 'number',
        describe: 'The block number to fork from',
      })
      .help(),
    async (args) => {
      const network = getRuntimeRequiredNetwork(args.network)

      if (network !== 'hardhat' && process.env.FORK)
        throw new Error(`${network} Not Support fork`)

      process.env.FORK = `${args.fork || ''}`
      process.env.FORK_BLOCK_NUMBER = `${args.forkBlockNumber || ''}`

      const command = [
        `node ${vitestBinRoot}`,
        args.watch ? 'watch' : 'run',
        `--environment=node`,
        `-r ${userRoot}`,
      ]

      try {
        exec(command)
      }
      catch {}
    },
  )
}
