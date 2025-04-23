import { bold, cyan, dim, gray, green, strikethrough, white, yellow } from 'kolorist'
import consola from 'consola'
import { environment } from '../imports'
import { waitForCallTrans, waitForDeplTrans } from './wait'
import { getDeployed, setDeployed } from './storage'
import { callUpgrade } from './upgrade-call'
import { resolveGeneratedFactory } from './resolver'

export async function upgrade(name: string, target: string) {
  const options = await getDeployed(name)

  if (!options)
    throw new Error(`${name} not been deployed, please deploy first`)

  const Factory = resolveGeneratedFactory(name, target)

  const implement = await waitForDeplTrans(
    [new Factory(environment.signer)],
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
    [callUpgrade, [options.address, implement.address, environment.signer]],
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
