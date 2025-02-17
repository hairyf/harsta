import type { Argv } from 'yargs'
import { deployer, environment, verifier } from '../features'

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
        required: true,
      })
      .option('force', {
        type: 'boolean',
        default: false,
      })
      .help(),
    async (args) => {
      await environment.initial(args.network!)
      const address = await resolveTargetAddress(args.target)
      const deployed = await deployer.getDeployed(args.target)
      await verifier.verify(address, {
        arguments: args.force && !deployed.kind && deployed.args || undefined,
        force: args.force,
      })
    },
  )
}

async function resolveTargetAddress(target: string) {
  if (target.startsWith('0x'))
    return target
  const deployment = await deployer.getDeployed(target)
  if (!deployment)
    throw new Error(`The contract(${target}) has not been deployed and manual verification is not currently supported`)
  return deployment.address
}
