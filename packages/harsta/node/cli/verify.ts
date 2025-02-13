import path from 'node:path'
import type { Argv } from 'yargs'
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan'
import fs from 'fs-extra'
import consola from 'consola'

import ERC1967Proxy from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json'
import TransparentUpgradeableProxyV5 from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json'
import TransparentUpgradeableProxyV4 from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json'

import { getUpgradeInterfaceVersion } from '@openzeppelin/upgrades-core'
import { JsonRpcProvider } from 'ethers'
import { encodeArguments, sleep } from '@nomicfoundation/hardhat-verify/internal/utilities'
import { userConf, userRoot } from '../constants'

export function registerVerifyCommand(cli: Argv) {
  cli.command(
    'verify',
    'verify the source of code of deployed contracts',
    args => args
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'The hardhat network used',
        required: true,
      })
      .option('target', {
        type: 'string',
        deprecate: 'contract name',
        required: true,
      })
      .help(),
    async (args) => {
      process.env.NETWORK = args.network

      const provider = new JsonRpcProvider(userConf.networks?.[args.network].rpc)
      const verify = userConf.networks?.[args.network].verify

      if (!verify?.uri)
        throw new Error(`The chain (${args.network}) has not filled in the verify config`)

      const instance = new Etherscan(
        verify.key || ' ', // Etherscan API key
        `${verify.uri}/api`, // Etherscan API URL
        `${verify.uri}`, // Etherscan browser URL
      )
      const deployment = await resolveInDeplJson(args.target)
      if (!deployment)
        throw new Error(`The contract(${args.target}) has not been deployed and manual verification is not currently supported`)

      const implement = deployment.history?.pop()
      const artifact = deployment.artifact || implement?.artifact
      const constructorArguments = !deployment.kind ? deployment.args : []
      const contractName = `${artifact.contractName}:${artifact.sourceName}`
      const contractAddress = implement.impl || deployment.address

      if (await instance.isVerified(contractAddress)) {
        consola.warn('The contract has been validated')
        return
      }

      const metadata = JSON.parse(artifact.metadata)
      const { message: guid } = await instance.verify(
        contractAddress,
        JSON.stringify(metadata),
        contractName,
        metadata.compiler.version,
        await encodeArguments(
          artifact.abi,
          artifact.sourceName,
          artifact.contractName,
          constructorArguments,
        ),
      )

      await sleep(1000)

      const status = await instance.getVerificationStatus(guid)
      if (status.isSuccess()) {
        const contractURL = instance.getContractUrl(contractAddress)
        consola.log(`Successfully verified contract ${contractName} on Etherscan: ${contractURL}`)
      }

      if (deployment.kind) {
        let artifact: typeof ERC1967Proxy | typeof TransparentUpgradeableProxyV5 | typeof TransparentUpgradeableProxyV4 | undefined

        if (deployment.kind === 'transparent') {
          const upgradeInterfaceVersion = await getUpgradeInterfaceVersion(provider, deployment.address)
          if (upgradeInterfaceVersion === '5.0.0') {
            artifact = TransparentUpgradeableProxyV5
          }
          else {
            artifact = TransparentUpgradeableProxyV4
          }
        }
        if (deployment.kind === 'uups') {
          artifact = ERC1967Proxy
        }
        if (!artifact)
          throw new Error(`Not find ${deployment.kind} Artifact`)

        const contractName = `${artifact.contractName}:${artifact.sourceName}`

        if (await instance.isVerified(deployment.address)) {
          consola.warn('The contract has been validated')
        }
        const { message: guid } = await instance.verify(
          deployment.address,
          '', // TODO source
          contractName,
          '', // TODO version
          await encodeArguments(
            artifact.abi,
            artifact.sourceName,
            artifact.contractName,
            deployment.args,
          ),
        )

        await sleep(1000)

        const status = await instance.getVerificationStatus(guid)
        if (status.isSuccess()) {
          const contractURL = instance.getContractUrl(contractAddress)
          consola.log(`Successfully2 verified contract ${contractName} on Etherscan: ${contractURL}`)
        }
      }
    },
  )
}

async function resolveInDeplJson(name: string) {
  const dirPath = path.resolve(`${userRoot}/config/deployments`, process.env.NETWORK || '')
  const filePath = path.resolve(dirPath, `${name}.json`)
  if (!fs.existsSync(filePath)) {
    consola.warn(`${name} not been deployed, please deploy first`)
    return
  }
  await fs.ensureDir(dirPath)
  return fs.readJSON(filePath)
}
