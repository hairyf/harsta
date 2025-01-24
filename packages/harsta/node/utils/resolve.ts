import path from 'node:path'
import { userRoot } from '../constants'

export function resolveUserPath(targetPath?: string, defaultPath?: string): string | undefined
export function resolveUserPath(targetPath: string, defaultPath: string): string
export function resolveUserPath(targetPath = '', defaultPath?: string) {
  return targetPath
    ? path.isAbsolute(targetPath)
      ? targetPath
      : path.resolve(userRoot, targetPath)
    : defaultPath as string
}
