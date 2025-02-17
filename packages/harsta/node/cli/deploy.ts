import type { Argv } from 'yargs'
import consola from 'consola'
import { confirm } from '@clack/prompts'
import { deployer, environment, verifier } from '../features'
import { noop } from './utils'

export function registerDeployCommand(cli: Argv) {
  cli.command(
    'deploy',
    'Deploy and save deployments',
    args => args
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'The harsta network used',
        required: true,
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
      await environment.initial(args.network!)
      args.compile && await environment.env.run('compile')

      const deployments = deployer.parseConfigs(args.contracts)

      if (!deployments.length) {
        consola.warn('Lack of deployable contracts in the harsta.config, please fill in the deployments field')
        return
      }

      consola.log('')

      for (const deployment of deployments) {
        if (!args.contracts && deployer.exists(deployment.name))
          continue

        if (deployer.exists(deployment.name)) {
          const message = `${deployment.name} been deployed, are sure to overwrite the deployment?`
          if (!await confirm({ message }))
            continue
        }

        const address = deployment.kind
          ? await deployer.deployUpgrade(deployment.name)
          : await deployer.deploy(deployment.name)

        consola.log('')

        if (!args.verify)
          return

        const deployed = await deployer.getDeployed(deployment.name)
        const options: verifier.VerifyOptions = {
          arguments: !deployed.kind && deployed.args || undefined,
          force: true,
        }
        await verifier.verify(address, options)
      }
    },
  )
}
