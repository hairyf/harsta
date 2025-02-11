import type { Argv } from 'yargs'
import { userConf } from '../constants'
import { exec, generateEnsureFiles, generateUpdateDirectory, hardhatBinRoot } from './utils'

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
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'the hardhat network used',
      })
      .help(),
    async (args) => {
      const networks = userConf.networks || {}
      const network = args.network
        || userConf.defaultNetwork
        || Object.keys(networks || {})[0]
      process.env.NETWORK = network

      await generateUpdateDirectory(
        args.name!,
        args.target,
      )
      await generateEnsureFiles()

      const rows = [
        `node ${hardhatBinRoot}`,
        `deploy`,
        `--network ${network}`,
      ]
      exec(rows.join(' '), { env: { NETWORK: network } })
    },
  )
}
