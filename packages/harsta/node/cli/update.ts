import type { Argv } from 'yargs'
import { deployer, environment } from '../features'

export function registerUpdateCommand(cli: Argv) {
  cli.command(
    'update [name]',
    'Update deployed upgradable contracts',
    args => args
      .positional('name', {
        type: 'string',
        describe: 'contract name',
      })
      .option('target', {
        type: 'string',
        demandOption: true,
        deprecate: 'next contract',
      })
      .option('compile', {
        type: 'boolean',
        default: true,
      })
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'the hardhat network used',
      })
      .help(),
    async (args) => {
      await environment.initial(args.network!)
      await environment.env.run('compile')

      await deployer.upgradeInDeploy(args.name!, args.target)
    },
  )
}
