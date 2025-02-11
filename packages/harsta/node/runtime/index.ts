import { JsonRpcApiProvider } from 'ethers'
import { bold, cyan, dim, gray, green, strikethrough, white, yellow } from 'kolorist'
import consola from 'consola'
import { userConf } from '../constants'
import {
  deployments,
  ethers,

  getFactoryOptsInProxy,
  getInitializerData,

  resolveInDeplJson,
  resolveInPackFile,

  upgradeToAddress,
  upgradeToCall,
  upgradeToDeplJson,

  waitForCallTrans,
  waitForDeplTrans,
} from './utils'

userConf.proxy && ethers.applyAgent(userConf.proxy)
ethers.fixedTaikoPending(JsonRpcApiProvider.prototype)

const factories = resolveInPackFile('./generated/typechains/index.ts')

export function createDeploy(name: string) {
  async function deploy() {
    const options = (userConf.deployments || {})[name]
    const target = options.target || name
    const network = process.env.NETWORK || ''
    const chainId = await ethers.getChainId()
    const deployer = await ethers.getDeployer()
    const singer = await ethers.getSinger(deployer)
    const artifact = await deployments.getArtifact(target)
    const args = await deployments.getArgs(name)

    const { receipt, transaction, address } = await waitForDeplTrans(
      [new factories[`${target}__factory`](singer), args],
      (transaction) => {
        consola.log('')
        consola.log(`${green(bold('TARGET'))}     ${white('>')}     ${white(`${name}:${target}.sol`)}`)
        consola.log(`${green(bold('NETWORK'))}    ${white('>')}     ${white(chainId)} ${gray(network)}`)
        consola.log(`${dim('Hash')}       ${white('>')}     ${yellow(transaction.hash)}`)
        consola.log(`${dim('From')}       ${white('>')}     ${gray(transaction.from)}`)
        if (args.length) {
          consola.log(`${dim(`Args`)}       ${white('>')}     ${gray(args[0])}`)
          for (const arg of args.slice(1))
            consola.log(`                `, gray(arg))
        }
        consola.log(`---------------------------------------------------------`)
      },
      (address) => {
        consola.log(`${dim('Address')}    ${white('>')}     ${cyan(address)}`)
      },
    )

    await upgradeToAddress(name, address)
    await upgradeToDeplJson(name, {
      address,
      hash: transaction.hash,
      args,
      receipt,
      artifact,
    })
  }

  deploy.tags = ['all', name]

  return deploy
}

export function createDeployInUpdate(name: string, kind: 'uups' | 'beacon' | 'transparent') {
  async function deploy() {
    const options = (userConf.deployments || {})[name]
    const target = options.target || name
    const network = process.env.NETWORK || ''
    const chainId = await ethers.getChainId()
    const deployer = await ethers.getDeployer()
    const singer = await ethers.getSinger(deployer)
    const artifact = await deployments.getArtifact(target)
    const args = await deployments.getArgs(name)

    const { address: implement, receipt: implReceipt } = await waitForDeplTrans(
      [new factories[`${target}__factory`](singer)],
      (transaction) => {
        consola.log('')
        consola.log(`${green(bold('TARGET'))}     ${white('>')}     ${white(`${name}:${target}.sol`)}`)
        consola.log(`${green(bold('NETWORK'))}    ${white('>')}     ${white(chainId)} ${gray(network)}`)
        consola.log(`${green(bold('kIND'))}       ${white('>')}     ${white(kind)}`)
        consola.log(`${dim('Hash')}       ${white('>')}     ${yellow(transaction.hash)}${gray('(implement)')}`)
        consola.log(`${dim('From')}       ${white('>')}     ${gray(transaction.from)}`)
        consola.log(`---------------------------------------------------------`)
      },
    )

    const inte = factories[`${target}__factory`].createInterface()
    const data = getInitializerData(inte, args, options)

    const { address, receipt: initReceipt } = await waitForDeplTrans(
      await getFactoryOptsInProxy(kind, implement, data, singer, options),
      (transaction) => {
        consola.log(`${dim('Hash')}       ${white('>')}     ${yellow(transaction.hash)}(${gray(kind)})`)
        consola.log(`${dim('From')}       ${white('>')}     ${gray(transaction.from)}`)
        if (args.length) {
          consola.log(`${dim(`Args`)}       ${white('>')}     ${gray(args[0])}`)
          for (const arg of args.slice(1))
            consola.log(`                `, gray(arg))
        }
        consola.log(`---------------------------------------------------------`)
      },
      (address) => {
        consola.log(`${dim('Implement')}  ${white('>')}     ${cyan(implement)}`)
        consola.log(`${dim('Proxy')}      ${white('>')}     ${cyan(address)}`)
      },
    )

    await upgradeToAddress(name, address)
    await upgradeToDeplJson(name, {
      address,
      impl: implement,
      hash: initReceipt.hash,
      kind,
      args,
      receipt: initReceipt,
      history: [
        {
          impl: implement,
          receipts: {
            impl: implReceipt,
            init: initReceipt,
          },
          artifact,
        },
      ],
    })
  }

  deploy.tags = ['all', name]
  return deploy
}

export function createUpdate(name: string, target: string) {
  async function update() {
    const options = await resolveInDeplJson(name)
    const network = process.env.NETWORK || ''
    const chainId = await ethers.getChainId()
    const deployer = await ethers.getDeployer()
    const singer = await ethers.getSinger(deployer)
    const artifact = await deployments.getArtifact(target)

    const { address: implement, receipt: implReceipt } = await waitForDeplTrans(
      [new factories[`${target}__factory`](singer)],
      (transaction) => {
        consola.log('')
        consola.log(`${green(bold('TARGET'))}     ${white('>')}     ${white(`${name}:${target}.sol`)}`)
        consola.log(`${green(bold('NETWORK'))}    ${white('>')}     ${white(chainId)} ${gray(network)}`)
        consola.log(`${green(bold('kIND'))}       ${white('>')}     ${white(options.kind)}`)
        consola.log(`${dim('Hash')}       ${white('>')}     ${yellow(transaction.hash)}${gray('(implement)')}`)
        consola.log(`${dim('From')}       ${white('>')}     ${gray(transaction.from)}`)
        consola.log(`---------------------------------------------------------`)
      },
    )

    const { receipt: callReceipt } = await waitForCallTrans(
      [upgradeToCall, [options.address, implement, singer]],
      (transaction) => {
        consola.log(`${dim('Hash')}       ${white('>')}     ${yellow(transaction.hash)}${gray('(upgradeTo)')}`)
        consola.log(`${dim('From')}       ${white('>')}     ${gray(transaction.from)}`)
        consola.log(`---------------------------------------------------------`)
      },
      () => {
        consola.log(`${dim('Implement')}  ${white('>')}     ${strikethrough(gray(options.impl))}`)
        consola.log(`                 ${cyan(implement)} ←`)
        consola.log(`${dim('Proxy')}      ${white('>')}     ${cyan(options.address)}`)
      },
    )

    options.impl = implement
    options.history.push({
      impl: implement,
      receipts: {
        impl: implReceipt,
        call: callReceipt,
      },
      artifact,

    })

    await upgradeToDeplJson(name, options)
  }
  update.tag = ['all', name]
  return update
}
