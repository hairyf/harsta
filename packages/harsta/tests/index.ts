/* eslint-disable no-console */
import type { ContractTransactionResponse, TransactionResponse } from 'ethers'
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

export async function fixture(contracts: string[]) {
  const deployments = deployer.parseDeployConfigs(contracts)
  await environment.env.run('compile')

  addresses[environment.network.id] = addresses[environment.network.id] ?? {}

  for (const deployment of deployments) {
    if (addresses[environment.network.id][deployment.name])
      return

    const address = deployment.kind
      ? await deployer.deployInUpgrade(deployment.name)
      : await deployer.deploy(deployment.name)

    addresses[environment.network.id][deployment.name] = address
    console.log(``)
    console.log(`fixture deployed ${deployment.name} - ${address}`)
  }
}

export async function waitForTrans(trans: ContractTransactionResponse | TransactionResponse) {
  return trans.getTransaction().then(trans => trans?.wait())
}
