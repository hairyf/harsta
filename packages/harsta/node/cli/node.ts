import path from 'pathe'
import { resolveConfig } from 'hardhat/internal/core/config/config-resolution'
import type { Argv } from 'yargs'
import { packRoot, userConf } from '../constants'
import { transformHarstaConfigToHardhat } from '../transform'
import { network } from '../features'

export function registerNodeCommand(cli: Argv) {
  cli.command(
    'node',
    'Starts a JSON-RPC server on top of Hardhat Network',
    args => args
      .option('hostname', {
        type: 'string',
        describe: 'The host to which to bind to for new connections (Defaults to 127.0.0.1 running locally, and 0.0.0.0 in Docker)',
      })
      .option('port', {
        type: 'number',
        describe: 'The port on which to listen for new connections',
        default: 8545,
      })
      .option('fork', {
        type: 'string',
        describe: 'The URL of the JSON-RPC server to fork from',
      })
      .option('forkBlockNumber', {
        type: 'number',
        describe: 'The block number to fork from',
      })
      .help(),
    async (args) => {
      process.env.NETWORK = 'hardhat'
      const config = resolveConfig(
        path.resolve(packRoot, 'hardhat.config.js'),
        transformHarstaConfigToHardhat(userConf),
      )

      if (args.fork && !args.fork.startsWith('http'))
        args.fork = userConf.networks?.[args.fork].rpc

      const adapterProvider = await network.createProvider(config, 'hardhat', args, userConf.proxy)
      const server = await network.createServer(adapterProvider, args)
      const watcher = await network.createWatcher(config, adapterProvider)

      network.printHardhatNetworkAccounts(config)

      await server.waitUntilClosed()
      await watcher?.close()
    },
  )
}
