import type { Argv } from 'yargs'
import { createDeploymentsManager } from '../features/deploy/manager'
import { createLazyProvider } from '../features/ethers'

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
      .help(),
    async (args) => {
      const provider = createLazyProvider(args.network)
      const deployments = createDeploymentsManager(provider, args.network)
      const accounts = await deployments.getUnnamedAccounts()
      console.log(accounts)
    },
  )
}
