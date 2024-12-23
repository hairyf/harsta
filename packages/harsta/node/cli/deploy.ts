import path from 'node:path'
import type { Argv } from 'yargs'
import consola from 'consola'
import fs from 'fs-extra'
import * as utils from '../utils'
import { packRoot, userConf, userRoot } from '../constants'
import type { DeploymentConfig } from '../types'
import { exec, generateDeployDirectory, hardhatBinRoot } from './utils'

export function registerDeployCommand(cli: Argv) {
  cli.command(
    'deploy',
    'Deploy and save deployments',
    args => args
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'the hardhat network used',
      })
      .option('reset', {
        type: 'boolean',
        default: false,
        describe: 'whether to delete deployments files first',
      })
      .option('contracts', {
        type: 'array',
        describe: 'Select the contract you want to deploy, `--contracts all` means all contracts',
      })
      .help(),
    async (args) => {
      const networks = userConf.networks || {}
      const network = args.network
        || userConf.defaultNetwork
        || Object.keys(networks || {})[0]
      const chainId = networks[network].id

      const deployments = resolveInDeployments()

      if (!deployments.length) {
        consola.warn('Lack of deployable contracts in the harsta.config, please fill in the deployments field')
        return
      }
      await fs.remove(path.resolve(packRoot, './contracts'))
      await fs.copy(
        path.resolve(userRoot, './contracts'),
        path.resolve(packRoot, './contracts'),
      )
      exec(`node ${hardhatBinRoot} clean`, { stdio: 'inherit' })
      exec(`node ${hardhatBinRoot} compile`, { stdio: 'inherit' })
      await generateDeployDirectory(userConf)

      const processes = deployments.map(async (item) => {
        const { name: next, updated } = await utils.compare(item.target, chainId)
        return { ...item, modified: updated, next }
      })
      const modifiedTags = await Promise.all(processes)
        .then(tags => tags.filter(t => t.modified))
      if (!modifiedTags.length) {
        consola.log('There are no contracts that can be updated')
        return
      }
      const modifiedDeploys = modifiedTags.filter(m => !args.contracts?.length
        || args.contracts?.includes('all')
        || args.contracts?.includes(m.target))

      for (const item of modifiedDeploys) {
        if (item.chains?.length && !item.chains.includes(chainId))
          continue
        await run(item.target, true)
      }

      async function run(target: string, restart = true) {
        if (!restart) {
          consola.warn('Running error, delete solc and attempt to redeploy')
          const directory = path.resolve(userRoot, `./.harsta/deployments/${network}/solcInputs`)
          await fs.emptyDir(directory)

          const files = await fs.readdir(directory)
          for (const file of files) {
            const filepath = path.resolve(directory, file)
            const json = await fs.readJSON(filepath)
            const name = Object.keys(json.sources)
              .find(key => key.endsWith(`/${target}.sol`))
            name && delete json.sources[name]
            await fs.writeJSON(filepath, json, { spaces: 2 })
          }
        }
        try {
          const rows = [
            `node ${hardhatBinRoot}`,
            `deploy --tags ${target}`,
            `--network ${network}`,
            args.reset && '--reset',
          ]
          exec(rows.filter(Boolean).join(' '))
        }
        catch {
          restart && run(target, false)
        }
      }
    },
  )
}

export function resolveInDeployments() {
  const deployments = userConf.deployments || {}
  const array = Object.keys(deployments).map((target) => {
    return Object.assign(
      { target },
      deployments[target],
    )
  })
  function sortByDependencies(arr: ({ target: string } & DeploymentConfig)[]) {
    const sortedArray: ({ target: string } & DeploymentConfig)[] = []
    const sortHelper = (target: string) => {
      const item = arr.find(el => el.target === target)
      if (item && item.dependencies)
        item.dependencies.forEach((dep: string) => sortHelper(dep))
      if (!sortedArray.some(el => el.target === target) && item)
        sortedArray.push(item)
    }

    arr.forEach((item) => {
      if (!sortedArray.some(el => el.target === item.target)) {
        sortHelper(item.target)
      }
    })
    return sortedArray
  }

  return sortByDependencies(array)
}
