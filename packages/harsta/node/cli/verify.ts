import type { Argv } from 'yargs'
import { deployer, environment, verifier } from '../features'
import { getRuntimeRequiredNetwork } from './utils'

export function registerVerifyCommand(cli: Argv) {
  cli.command(
    'verify [target]',
    'verify the source of code of deployed contracts',
    args => args
      .positional('target', {
        type: 'string',
        describe: 'contract name or address',
        demandOption: true,
      })
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'The harsta network used',
      })
      .option('force', {
        type: 'boolean',
        default: false,
      })
      .help(),
    async (args) => {
      const network = getRuntimeRequiredNetwork(args.network)

      await environment.initial(network)
      const deployed = await deployer.getDeployed(args.target)
      const address = await deployer.getAddress(args.target)

      if (!address)
        throw new Error(`The contract(${args.target}) has not been deployed and manual verification is not currently supported`)

      await verifier.verify(address, {
        arguments: (args.force && !deployed.kind && deployed.args) || undefined,
        force: args.force,
      })
    },
  )
}
