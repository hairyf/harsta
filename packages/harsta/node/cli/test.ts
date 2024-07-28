import type { Argv } from 'yargs'
import { userConf } from '../constants'
import { exec, generateDeployDirectory } from './utils'

export function registerTestCommand(cli: Argv) {
  cli.command(
    'test',
    'runs mocha tests',
    args => args
      .option('network', {
        alias: 'n',
        type: 'string',
        describe: 'The hardhat network used (default use of hardhat network)',
        default: 'hardhat',
      })
      .help(),
    async (args) => {
      await generateDeployDirectory(userConf)
      try {
        exec(`npx hardhat test --network ${args.network}`, { TEST_ENV: true })
      }
      catch {}
    },
  )
}
