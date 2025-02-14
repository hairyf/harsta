import type { ExecSyncOptionsWithBufferEncoding } from 'node:child_process'
import { execSync } from 'node:child_process'
import { clientRoot, packRoot, userRoot } from '../../constants'

export interface Options {
  env?: Record<string, any>
  root?: string
}

export function exec(command: string | (string | boolean | undefined)[], options?: ExecSyncOptionsWithBufferEncoding) {
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
  execSync(Array.isArray(command)
    ? command.filter(Boolean).join(' ')
    : command, _options)
}
