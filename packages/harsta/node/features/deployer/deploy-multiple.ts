import { confirm } from '@clack/prompts'
import consola from 'consola'
import { verifier } from '../imports'
import { network } from '../environment'
import { exists } from './exists'
import { deploy, deployUpgrade } from './deploy'
import { getDeployed } from './storage'

export interface Options {
  contracts?: string[]
  verify?: boolean
}

export async function deployMultiple(deployments: any[], options: Options = {}) {
  if (!deployments.length) {
    consola.warn('Lack of deployable contracts in the harsta.config, please fill in the deployments field')
    return
  }

  consola.log('')

  for (const deployment of deployments) {
    if (!options.contracts && exists(deployment.name))
      continue

    if (exists(deployment.name)) {
      const message = `${deployment.name} been deployed, are sure to overwrite the deployment?`
      if (!await confirm({ message }))
        continue
    }

    const address = deployment.kind
      ? await deployUpgrade(deployment.name)
      : await deploy(deployment.name)

    consola.log('')

    if (!options.verify || network.name === 'hardhat')
      continue

    const deployed = await getDeployed(deployment.name)

    await verifier.verify(address, {
      arguments: (!deployed?.kind && deployed.args) || undefined,
      force: true,
    })
  }
}
