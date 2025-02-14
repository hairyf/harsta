import type { Argv } from 'yargs'
import { environment } from '../features/imports'

export function registerRunCommand(cli: Argv) {
  cli.command(
    'run',
    'run any',
    args => args
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'The hardhat network used (default use of hardhat network)',
        default: 'hardhat',
      })
      .option('clean', {
        deprecate: 'Clears the cache and deletes all artifacts',
        alias: 'c',
        type: 'boolean',
      })
      .help(),
    async (args) => {
      await environment.initial(args.network)
    },
  )
}
