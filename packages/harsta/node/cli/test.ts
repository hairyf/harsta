import type { Argv } from 'yargs'
import { userRoot } from '../constants'
import features from '../features'
import { exec, vitestBinRoot } from './utils'

export function registerTestCommand(cli: Argv) {
  cli.command(
    'test',
    'runs vitest tests',
    args => args
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'The hardhat network used (default use of hardhat network)',
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
      if (process.env.NETWORK !== 'hardhat' && process.env.FORK)
        throw new Error(`${process.env.NETWORK} Not Support fork`)

      process.env.NETWORK = args.network
      process.env.FORK = `${args.fork || ''}`
      process.env.FORK_BLOCK_NUMBER = `${args.forkBlockNumber || ''}`

      exec([
        `node ${vitestBinRoot}`,
        args.watch ? 'watch' : 'run',
        `--environment=node`,
        `-r ${userRoot}`,
      ])
    },
  )
}
