/* eslint-disable no-console */

import { exec } from 'node:child_process'
import { HardhatEthersProvider } from '@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider'
import type { ContractTransactionResponse, TransactionResponse } from 'ethers'
import { userConf } from '../node/constants'
import { hardhatBinRoot } from '../node/cli/utils'
import { createDeploy, createDeployInUpdate } from '../node/deploy'
import { addresses, getChainId, getNamedAccount, getSinger, getUnnamedAccount, updateProvider, updateSigner } from '../runtime'
import { hardhatConfig } from '../runtime/config'
import * as factories from '../generated/typechains'
import { lazyEthereumProvider } from '../runtime/network'
import { resolveInDeployments } from './utils'

export async function initial() {
  const ethereumProvider = await lazyEthereumProvider.init()
  const provider = new HardhatEthersProvider(
    ethereumProvider,
    process.env.NETWORK!,
  )
  if (process.env.FORK && process.env.FORK !== 'undefined')
    await ethereumProvider.request({ method: 'hardhat_mine', params: [1, 1] })

  const account = await getNamedAccount('deployer') || await getUnnamedAccount()
  const singer = await getSinger(account)
  Reflect.set(provider, 'chainId', getChainId())
  Reflect.set(singer, 'chainId', getChainId())

  updateSigner(singer as any)
  updateProvider(provider)
}

export async function fixture(contracts: string[]) {
  const deployments = resolveInDeployments(
    userConf.networks?.[process.env.NETWORK!]?.id,
    contracts,
  )
  const chainId = hardhatConfig.networks[process.env.NETWORK!].chainId!
  exec(`node ${hardhatBinRoot} compile`)

  addresses[chainId] = addresses[chainId] ?? {}

  for (const deployment of deployments) {
    if (addresses[chainId][deployment.name])
      return
    const deploy = deployment.kind
      ? createDeployInUpdate(deployment.name, deployment.kind, factories)
      : createDeploy(deployment.name, factories)

    const account = await getNamedAccount('deployer') || await getUnnamedAccount()
    const singer = await getSinger(account)

    const address = await deploy({ singer: singer as any, chainId })

    addresses[chainId][deployment.name] = address
    console.log(``)
    console.log(`fixture deployed ${deployment.name} - ${address}`)
  }
}

export async function waitForTrans(trans: ContractTransactionResponse | TransactionResponse) {
  return trans.getTransaction().then(trans => trans?.wait())
}
