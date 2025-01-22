import type { ExecSyncOptionsWithBufferEncoding } from 'node:child_process'
import { execSync } from 'node:child_process'
import { clientRoot, packRoot, userRoot } from '../../constants'

export interface Options {
  env?: Record<string, any>
  root?: string
}

export function exec(command: string, options?: ExecSyncOptionsWithBufferEncoding) {
  const _options: ExecSyncOptionsWithBufferEncoding = {
    stdio: 'inherit',
    cwd: packRoot,
    ...options,
    env: {
      ...process.env,
      ...options?.env,
      clientRoot,
      packRoot,
      userRoot,
    },
  }
  execSync(command, _options)
}
