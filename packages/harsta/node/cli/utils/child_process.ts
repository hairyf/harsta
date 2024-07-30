import type { ExecSyncOptionsWithBufferEncoding } from 'node:child_process'
import { execSync } from 'node:child_process'
import { clientRoot, packRoot, userRoot } from '../../constants'

export interface Options {
  env?: Record<string, any>
  root?: string
}

export function exec(command: string, env: any = {}, cwd = packRoot) {
  const options: ExecSyncOptionsWithBufferEncoding = {
    stdio: 'inherit',
    cwd,
    env: {
      clientRoot,
      packRoot,
      userRoot,
      ...env,
    },
  }
  execSync(command, options)
}
