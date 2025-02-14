import type { Argv } from 'yargs'
import features from '../features'

export function registerCompileCommand(cli: Argv) {
  cli.command(
    'compile',
    'Compile and output the dist directory',
    args => args
      .option('output', {
        describe: 'output directory, default output to @harsta/client, if not installed, output dist',
        alias: 'o',
        type: 'string',
      })
      .option('clean', {
        deprecate: 'Clears the cache and deletes all artifacts',
        alias: 'c',
        type: 'boolean',
      })
      .help(),
    features.compiler.compile,
  )
}
