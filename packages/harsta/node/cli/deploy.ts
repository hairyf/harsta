import type { Argv } from 'yargs'
import consola from 'consola'
import { confirm } from '@clack/prompts'
import { deployer, environment } from '../features'

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
      await environment.initial(args.network!)
      await environment.env.run('compile')

      const deployments = deployer.parseDeployConfigs(
        args.contracts as string[],
      )

      if (!deployments.length) {
        consola.warn('Lack of deployable contracts in the harsta.config, please fill in the deployments field')
        return
      }

      for (const deployment of deployments) {
        if (!args.contracts && deployer.exists(deployment.name))
          continue

        if (deployer.exists(deployment.name)) {
          const message = `${deployment.name} been deployed, are sure to overwrite the deployment?`
          if (!await confirm({ message }))
            continue
        }

        deployment.kind
          ? await deployer.deployInUpgrade(deployment.name)
          : await deployer.deploy(deployment.name)
      }
    },
  )
}
