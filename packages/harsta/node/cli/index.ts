import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { version } from '../../package.json'
import { registerCompileCommand } from './compile'
import { registerDeployCommand } from './deploy'
import { registerTestCommand } from './test'

export const cli = yargs(hideBin(process.argv)).scriptName('harsta')
  .version(version)
  .showHelpOnFail(false)
  .alias('h', 'help')
  .alias('v', 'version')

registerCompileCommand(cli)
registerTestCommand(cli)
registerDeployCommand(cli)

export async function main() {
  cli.help().parse()
}
