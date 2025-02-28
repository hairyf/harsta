import type { Argv } from 'yargs'
import { deployer, environment } from '../features'
import { getRuntimeRequiredNetwork } from './utils'

export function registerDeployCommand(cli: Argv) {
  cli.command(
    'deploy',
    'Deploy and save deployments',
    args => args
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'The harsta network used',
      })
      .option('contracts', {
        type: 'array',
        describe: 'Select the contract you want to deployments, `--contracts all` means all contracts',
        string: true,
      })
      .option('compile', {
        type: 'boolean',
        default: true,
      })
      .option('verify', {
        type: 'boolean',
        default: false,
      })
      .help(),
    async (args) => {
      const network = getRuntimeRequiredNetwork(args.network)

      await environment.initial(network)
      args.compile && await environment.env.run('compile')

      const deployments = deployer.parseConfigs(args.contracts)

      await deployer.deployMultiple(deployments, args)
    },
  )
}
