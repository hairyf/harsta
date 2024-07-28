import type { HardhatRuntimeEnvironment } from 'hardhat/types'
import { compare } from '../utils'
import { args, upgradeAddress, upgradeStorage } from './utils'

export function createDeploy(name: string) {
  async function deploy(env: HardhatRuntimeEnvironment) {
    const chainId = await env.getChainId()
    const { updated, nextMd5 } = await compare(name, chainId)
    if (!updated)
      return
    const unnamedAccounts = await env.getUnnamedAccounts()
    const namedAccounts = await env.getNamedAccounts()
    const deployer = namedAccounts.deployer || unnamedAccounts[0]
    const { address } = await env.deployments.deploy(name, {
      args: await args(name),
      from: deployer,
      log: true,
    })
    if (!process.env.TEST_ENV) {
      await upgradeStorage(name, nextMd5)
      await upgradeAddress(name, address)
    }
  }

  deploy.tags = ['all', name]

  return deploy
}

export function createUpdate(name: string, type: 'proxy' | 'uups' | 'beacon' | 'transparent') {
  async function deploy(env: HardhatRuntimeEnvironment) {
    let address = await env.deployments.get(name)
      .then(deployment => deployment.address)
      .catch(() => Promise.resolve(undefined))
    const chainId = await env.getChainId()

    const { name: next, updated, nextMd5 } = await compare(name, chainId)

    if (!updated || !address) {
      const contract = await env.upgrades.deployProxy(
        await env.ethers.getContractFactory(name),
        await args(name),
        {
          initializer: 'initialize',
          ...(type !== 'proxy'
            ? { kind: type }
            : {}),
        },
      )
      address = await contract.getAddress()
    }
    else {
      const factory = await env.ethers.getContractFactory(next)
      await env.upgrades.upgradeProxy(address, factory)
    }

    const artifact = await env.deployments.getExtendedArtifact(next)
    await env.deployments.save(name, { address, ...artifact })
    if (!process.env.TEST_ENV) {
      await upgradeStorage(next, nextMd5)
      await upgradeAddress(name, address)
    }
  }

  deploy.tags = ['all', name]
  return deploy
}
