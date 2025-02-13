import type { HarstaUserConfig } from '../types'
import { loadConfig } from '../config'
import { userRoot } from './root'

export const { config: userConf } = loadConfig<HarstaUserConfig & { default: HarstaUserConfig }>({
  name: 'harsta',
  cwd: userRoot,
})
