import path from 'node:path'

import type { Argv } from 'yargs'
import { exec, hardhatBinRoot } from './utils'

export function registerVerifyCommand(cli: Argv) {
  cli.command(
    'verify',
    'verify the source of code of deployed contracts',
    args => args
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'The hardhat network used',
      })
      .option('contracts', {
        type: 'array',
        describe: 'Select the contract you want to deploy, `--contracts all` means all contracts',
      })
      .help(),
    async (args) => {
      const networks = userConf.networks || {}
      const network = args.network
        || userConf.defaultNetwork
        || Object.keys(networks || {})[0]

      const commandArgs = [
        args.contracts?.length && `--contract-name ${args.contracts}`,
        `--network ${network}`,
      ]

      exec(`node ${hardhatBinRoot} etherscan-verify ${commandArgs.filter(Boolean).join(' ')}`, { stdio: 'inherit' })
    },
  )
}
