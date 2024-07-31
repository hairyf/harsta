import type { Argv } from 'yargs'
import consola from 'consola'
import * as utils from '../utils'
import { packRoot, userConf, userRoot } from '../constants'
import { exec, generateDeployDirectory, hardhatBinRoot } from './utils'

export function registerDeployCommand(cli: Argv) {
  cli.command(
    'deploy',
    'Deploy and save deployments',
    args => args
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'the hardhat network used',
      })
      .option('reset', {
        type: 'boolean',
        default: false,
        describe: 'whether to delete deployments files first',
      })
      .help(),
    async (args) => {
      const networks = userConf.networks || {}
      const network = args.network
        || userConf.defaultNetwork
        || Object.keys(networks || {})[0]
      const chainId = networks[network].id

      const deployments = userConf.deployments || {}
      const names = Object.keys(deployments)

      if (!names.length) {
        consola.warn('Lack of deployable contracts in the harsta.config, please fill in the deployments field')
        return
      }

      await generateDeployDirectory(userConf)

      const processes = names.map(async (name) => {
        const { name: next, updated } = await utils.compare(name, chainId)
        return { name, modified: updated, next }
      })
      const modifiedTags = await Promise.all(processes)
        .then(tags => tags.filter(t => t.modified))
        .then(tags => tags.map(t => t.name))
      if (!modifiedTags.length) {
        consola.log('There are no contracts that can be updated')
        return
      }

      exec(`node ${hardhatBinRoot} deploy --tags ${modifiedTags} --network ${network} ${(args.reset && '--reset') || ''}`, { stdio: 'inherit' })
      exec(`node ${packRoot}/bin/index.cjs compile`, {}, userRoot)
    },
  )
}
