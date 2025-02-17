import { bold, cyan, dim, gray, green, strikethrough, white, yellow } from 'kolorist'
import consola from 'consola'
import { userConf } from '../../constants'
import { environment } from '../imports'
import { resolvePackageFile } from './util'
import { waitForCallTrans, waitForDeplTrans } from './wait'
import { parseArgs } from './parse'
import { getDeployed, setAddress, setDeployed } from './storage'
import { getInitializerData } from './initializer'
import { callUpgrade, getUpgradeFactoryArgs, getUpgradeFactoryInstance } from './upgrade'

export async function deploy(name: string) {
  const factories = resolvePackageFile('./generated/typechains/index.ts')
  const config = userConf.deployments?.[name]

  if (!config)
    throw new Error(`Not found ${name} deployment configure`)

  const args = await parseArgs(config)
  const target = config.target || name

  const { receipt, transaction, address } = await waitForDeplTrans(
    [new factories[`${target}__factory`](environment.signer), args],
    (transaction) => {
      consola.log(`${green(bold('TARGET'))}     ${white('>')}     ${white(`${name}:${target}.sol`)}`)
      consola.log(`${green(bold('NETWORK'))}    ${white('>')}     ${white(environment.network.id)} ${gray(environment.network.alias)}`)
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

  const artifact = await environment.getExtendedArtifact(target)

  if (environment.network.alias === 'hardhat')
    return address

  await setAddress(name, address)
  await setDeployed(name, {
    address,
    hash: transaction.hash,
    args,
    receipt,
    artifact,
  })

  return address
}

export async function deployUpgrade(name: string) {
  const factories = resolvePackageFile('./generated/typechains/index.ts')

  const config = userConf.deployments?.[name]
  const kind = config?.kind as string
  if (!config)
    throw new Error(`Not found ${name} deployment configure`)

  const target = config.target || name

  const implement = await waitForDeplTrans(
    [new factories[`${target}__factory`](environment.signer)],
    (transaction) => {
      consola.log(`${green(bold('TARGET'))}     ${white('>')}     ${white(`${name}:${target}.sol`)}`)
      consola.log(`${green(bold('NETWORK'))}    ${white('>')}     ${white(environment.network.id)} ${gray(environment.network.alias)}`)
      consola.log(`${green(bold('kIND'))}       ${white('>')}     ${white(kind)}`)
      consola.log(`${dim('Hash')}       ${white('>')}     ${yellow(transaction.hash)}${gray('(implement)')}`)
      consola.log(`${dim('From')}       ${white('>')}     ${gray(transaction.from)}`)
      consola.log(`---------------------------------------------------------`)
    },
  )

  const inter = factories[`${target}__factory`].createInterface()
  const initializeArgs = await parseArgs(config)
  const data = getInitializerData(inter, initializeArgs, config)

  const proxy = await waitForDeplTrans(
    [
      await getUpgradeFactoryInstance(kind, environment.signer),
      await getUpgradeFactoryArgs(kind, implement.address, data, environment.signer, config),
    ],
    (transaction) => {
      consola.log(`${dim('Hash')}       ${white('>')}     ${yellow(transaction.hash)}(${gray(kind)})`)
      consola.log(`${dim('From')}       ${white('>')}     ${gray(transaction.from)}`)
      if (initializeArgs.length) {
        consola.log(`${dim(`Args`)}       ${white('>')}     ${gray(initializeArgs[0])}`)
        for (const arg of initializeArgs.slice(1))
          consola.log(`                `, gray(arg))
      }
      consola.log(`---------------------------------------------------------`)
    },
    (address) => {
      consola.log(`${dim('Implement')}  ${white('>')}     ${cyan(implement.address)}`)
      consola.log(`${dim('Proxy')}      ${white('>')}     ${cyan(address)}`)
    },
  )

  if (environment.network.alias === 'hardhat')
    return proxy.address

  const artifact = await environment.getExtendedArtifact(target)

  await setAddress(name, proxy.address)
  await setDeployed(name, {
    address: proxy.address,
    impl: implement,
    hash: proxy.receipt.hash,
    kind,
    args: proxy.args,
    initialize: initializeArgs,
    receipt: proxy.receipt,
    history: [
      {
        impl: implement.address,
        receipts: {
          impl: implement.receipt,
          init: proxy.receipt,
        },
        artifact,
      },
    ],
  })

  return proxy.address
}

export async function upgradeDeploy(name: string, target: string) {
  const factories = resolvePackageFile('./generated/typechains/index.ts')

  const options = await getDeployed(name)

  if (!options)
    throw new Error(`${name} not been deployed, please deploy first`)

  const implement = await waitForDeplTrans(
    [new factories[`${target}__factory`](environment.signer)],
    (transaction) => {
      consola.log(`${green(bold('TARGET'))}     ${white('>')}     ${white(`${name}:${target}.sol`)}`)
      consola.log(`${green(bold('NETWORK'))}    ${white('>')}     ${white(environment.network.id)} ${gray(environment.network.alias)}`)
      consola.log(`${green(bold('kIND'))}       ${white('>')}     ${white(options.kind)}`)
      consola.log(`${dim('Hash')}       ${white('>')}     ${yellow(transaction.hash)}${gray('(implement)')}`)
      consola.log(`${dim('From')}       ${white('>')}     ${gray(transaction.from)}`)
      consola.log(`---------------------------------------------------------`)
    },
  )

  const updated = await waitForCallTrans(
    [callUpgrade, [options.address, implement, environment.signer]],
    (transaction) => {
      consola.log(`${dim('Hash')}       ${white('>')}     ${yellow(transaction.hash)}${gray('(upgradeTo)')}`)
      consola.log(`${dim('From')}       ${white('>')}     ${gray(transaction.from)}`)
      consola.log(`---------------------------------------------------------`)
    },
    () => {
      consola.log(`${dim('Implement')}  ${white('>')}     ${strikethrough(gray(options.impl))}`)
      consola.log(`                 ${cyan(implement.address)} ←`)
      consola.log(`${dim('Proxy')}      ${white('>')}     ${cyan(options.address)}`)
    },
  )

  const artifact = await environment.getArtifact(target)

  options.impl = implement
  options.history.push({
    impl: implement.address,
    receipts: {
      impl: implement.receipt,
      call: updated.receipt,
    },
    artifact,
  })

  await setDeployed(name, options)
}
