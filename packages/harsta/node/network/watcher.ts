import consola from 'consola'
import { watchCompilerOutput } from 'hardhat/builtin-tasks/utils/watch'
import { Reporter } from 'hardhat/internal/sentry/reporter'
import type { EthereumProvider, HardhatConfig } from 'hardhat/types'
import picocolors from 'picocolors'
import type { FSWatcher } from 'chokidar'

export async function createWatcher(config: HardhatConfig, provider: EthereumProvider) {
  let watcher: FSWatcher | undefined
  try {
    watcher = await watchCompilerOutput(provider, config.paths)
  }
  catch (error) {
    console.warn(
      picocolors.yellow(
        'There was a problem watching the compiler output, changes in the contracts won\'t be reflected in the Hardhat Network. Run Hardhat with --verbose to learn more.',
      ),
    )

    consola.log(
      'Compilation output can\'t be watched. Please report this to help us improve Hardhat.\n',
      error,
    )
    if (error instanceof Error)
      Reporter.reportError(error)
  }
  return watcher
}
