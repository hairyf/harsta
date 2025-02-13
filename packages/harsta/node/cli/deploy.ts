import path from 'node:path'
import type { Argv } from 'yargs'
import consola from 'consola'
import fs from 'fs-extra'
import { confirm } from '@clack/prompts'
import { userConf, userRoot } from '../constants'
import { exec, generateDeployDirectory, generateEnsureFiles, hardhatBinRoot } from './utils'

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
      .option('contracts', {
        type: 'array',
        describe: 'Select the contract you want to deploy, `--contracts all` means all contracts',
      })
      .option('compile', {
        type: 'boolean',
        default: true,
      })
      .help(),
    async (args) => {
      const networks = userConf.networks || {}
      const network = args.network
        || userConf.defaultNetwork
        || Object.keys(networks || {})[0]

      process.env.NETWORK = network

      const deployments = resolveInDeployments(
        networks[network]?.id,
        args.contracts as string[],
      )

      if (!deployments.length) {
        consola.warn('Lack of deployable contracts in the harsta.config, please fill in the deployments field')
        return
      }

      await generateDeployDirectory(userConf)
      await generateEnsureFiles()

      args.compile && exec(`node ${hardhatBinRoot} compile`)

      const tags: string[] = []

      const directory = path.resolve(`${userRoot}/config/deployments`, network)

      for (const deployment of deployments) {
        const file = path.resolve(directory, `${deployment.name}.json`)
        const exists = fs.existsSync(file)

        if (!args.contracts && exists)
          continue

        if (exists) {
          const message = `${deployment.name} been deployed, are sure to overwrite the deployment?`
          const confirmed = await confirm({ message })
          if (!confirmed)
            continue
        }
        tags.push(deployment.name)
      }

      tags.length && exec(`node ${hardhatBinRoot} deploy --tags ${tags} --network ${network}`, { env: { NETWORK: network } })
    },
  )
}

function resolveInDeployments(chainId?: number, filter?: string[]) {
  const deployments = userConf.deployments || {}
  const array = Object
    .keys(deployments).map((name) => {
      return { name, target: name, ...deployments[name] }
    })
    .filter(item => (item.chains && chainId)
      ? item.chains.includes(chainId)
      : true)
    .filter(item => filter
      ? filter.includes(item.name)
      : true,
    )
  return array
}
