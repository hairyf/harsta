import type { ExecSyncOptionsWithBufferEncoding } from 'node:child_process'
import { execSync } from 'node:child_process'
import { clientRoot, packRoot, userRoot } from '../../constants'

export interface Options {
  env?: Record<string, any>
  root?: string
}

export function exec(command: string, env: any = {}) {
  const options: ExecSyncOptionsWithBufferEncoding = {
    stdio: 'inherit',
    cwd: packRoot,
    env: {
      clientRoot,
      packRoot,
      userRoot,
      ...env,
    },
  }
  execSync(command, options)
}
