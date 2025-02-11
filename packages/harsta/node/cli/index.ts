import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { version } from '../../package.json'
import { registerCompileCommand } from './compile'
import { registerDeployCommand } from './deploy'
import { fixtureHardhat } from './fixture'
import { registerUpdateCommand } from './update'
// import { registerTestCommand } from './test'
// import { registerVerifyCommand } from './verify'

export const cli = yargs(hideBin(process.argv)).scriptName('harsta')
  .version(version)
  .showHelpOnFail(false)
  .alias('h', 'help')
  .alias('v', 'version')

registerCompileCommand(cli)
registerDeployCommand(cli)
registerUpdateCommand(cli)
// TODO

// registerTestCommand(cli)
// registerVerifyCommand(cli)

export function main() {
  fixtureHardhat()
  cli.help().parse()
}
