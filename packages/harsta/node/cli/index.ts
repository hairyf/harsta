import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { version } from '../../package.json'
import { registerCompileCommand } from './compile'
import { registerDeployCommand } from './deploy'
import { fixtureHardhatAndBigInt } from './fixture'
import { registerUpdateCommand } from './update'
import { registerNodeCommand } from './node'
import { registerTestCommand } from './test'
import { registerVerifyCommand } from './verify'
import { registerRunCommand } from './run'

export const cli = yargs(hideBin(process.argv)).scriptName('harsta')
  .version(version)
  .showHelpOnFail(false)
  .alias('h', 'help')
  .alias('v', 'version')

registerRunCommand(cli)
registerCompileCommand(cli)
registerDeployCommand(cli)
registerUpdateCommand(cli)
registerNodeCommand(cli)
registerTestCommand(cli)
registerVerifyCommand(cli)

export function main() {
  fixtureHardhatAndBigInt()
  cli.help().parse()
}
