/* eslint-disable no-extend-native */
/* eslint-disable ts/ban-ts-comment */
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { version } from '../../package.json'
import { registerCompileCommand } from './compile'
import { registerDeployCommand } from './deploy'
import { fixtureHardhat } from './fixture'
import { registerUpdateCommand } from './update'
import { registerNodeCommand } from './node'
import { registerTestCommand } from './test'
// import { registerVerifyCommand } from './verify'

export const cli = yargs(hideBin(process.argv)).scriptName('harsta')
  .version(version)
  .showHelpOnFail(false)
  .alias('h', 'help')
  .alias('v', 'version')

// @ts-expect-error
BigInt.prototype.toJSON = function (this) {
  return this.toString()
}

registerCompileCommand(cli)
registerDeployCommand(cli)
registerUpdateCommand(cli)
registerNodeCommand(cli)
registerTestCommand(cli)

// registerVerifyCommand(cli)

export function main() {
  fixtureHardhat()
  cli.help().parse()
}
