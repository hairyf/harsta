import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { version } from '../../package.json'
import { registerCompileCommand } from './compile'
import { registerDeployCommand } from './deploy'
import { registerTestCommand } from './test'
import { fixtureHardhat } from './fixture'

export const cli = yargs(hideBin(process.argv)).scriptName('harsta')
  .version(version)
  .showHelpOnFail(false)
  .alias('h', 'help')
  .alias('v', 'version')

registerCompileCommand(cli)
registerTestCommand(cli)
registerDeployCommand(cli)

export function main() {
  fixtureHardhat()
  cli.help().parse()
}
