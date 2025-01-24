import path from 'node:path'
import type { Argv } from 'yargs'
import fs from 'fs-extra'
import consola from 'consola'
import { userConf, userRoot } from '../constants'
import { loadConfig } from '../config'
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
      const chainId = userConf.networks?.[network].id

      const deployments = userConf.deployments || {}
      const defaultNames = args.contracts || Object.keys(deployments)
      const isAllContracts = args.contracts?.includes('all')
        || !args.contracts?.length

      const names = isAllContracts ? defaultNames : args.contracts
      const addrFile = path.resolve(userRoot, './config/addresses.ts')
      const jsonFile = path.resolve(userRoot, './config/addresses.json')

      let addresses: Record<string, Record<string, string>> = {}
      if (fs.existsSync(addrFile)) {
        const { config } = loadConfig({
          cwd: path.dirname(addrFile),
          name: 'addresses',
        })
        addresses = config
      }
      else if (fs.existsSync(jsonFile)) {
        addresses = fs.readJSONSync(jsonFile)
      }

      for (const name of names || []) {
        const address = addresses?.[chainId!]?.[name]
        if (!address)
          consola.log(`${name} not find address`)

        const commandArgs = [`--network ${network}`, `${address}`]
        try {
          exec(`node ${hardhatBinRoot} verify ${commandArgs.join(' ')}`)
        }
        catch {}
      }

      // exec(`node ${hardhatBinRoot} etherscan-verify ${commandArgs.filter(Boolean).join(' ')}`, { stdio: 'inherit' })
    },
  )
}
