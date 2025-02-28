import type { Argv } from 'yargs'
import { deployer, environment } from '../features'
import { getRuntimeRequiredNetwork } from './utils'

export function registerUpdateCommand(cli: Argv) {
  cli.command(
    'update [name]',
    'Update deployed upgradable contracts',
    args => args
      .positional('name', {
        type: 'string',
        describe: 'contract name',
      })
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'The harsta network used',
      })
      .option('target', {
        type: 'string',
        required: true,
        describe: 'next contract',
      })
      .option('compile', {
        type: 'boolean',
        default: true,
      })
      .help(),
    async (args) => {
      const network = getRuntimeRequiredNetwork(args.network)

      await environment.initial(network)
      await environment.env.run('compile')

      await deployer.upgrade(args.name!, args.target)
    },
  )
}
