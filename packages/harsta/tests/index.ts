/* eslint-disable no-console */
import { addresses, updateProvider, updateSigner } from '../runtime'
import { deployer, environment } from '../node/features'
import { forking } from './config'

export async function initial() {
  await environment.initial(process.env.NETWORK!, forking)

  if (process.env.FORK && process.env.FORK !== 'undefined')
    await environment.env.network.provider.request({ method: 'hardhat_mine', params: [1, 1] })

  updateSigner(environment.signer)
  updateProvider(environment.provider)
}

export async function fixture(tags: string[]) {
  const configs = tags.map((tag) => {
    const [name, target] = tag.split(':')
    return {
      ...deployer.parseConfig(name),
      update: !!target,
    }
  })
  await environment.env.run('compile')

  addresses[environment.network.id] = addresses[environment.network.id] ?? {}

  for (const config of configs) {
    if (addresses[environment.network.id][config.name])
      return

    if (config.update) {
      await deployer.upgradeDeploy(config.name, config.target)
      const deployed = await deployer.getDeployed(config.name)
      console.log(``)
      console.log(`fixture deployed ${config.name} - ${deployed.address}`)
      return
    }

    const address = config.kind
      ? await deployer.deployUpgrade(config.name)
      : await deployer.deploy(config.name)

    addresses[environment.network.id][config.name] = address
    console.log(``)
    console.log(`fixture deployed ${config.name} - ${address}`)
  }
}

export { waitForTrans } from '../node/utils/ethers'
