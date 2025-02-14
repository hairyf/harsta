import { resolveConfig } from 'hardhat/internal/core/config/config-resolution'
import path from 'pathe'
import { transformHarstaConfigToHardhat } from '../transform'
import type { HarstaUserConfig } from '../types'
import { loadConfig } from '../utils/config'
import { packRoot, userRoot } from './root'

export const userConf = loadConfig<HarstaUserConfig & { default: HarstaUserConfig }>({ name: 'harsta', cwd: userRoot }).config
export const hardhatUserConf = transformHarstaConfigToHardhat(userConf)
export const hardhatConf = resolveConfig(path.resolve(packRoot, 'hardhat.config.ts'), hardhatUserConf)

if (!userConf.networks)
  userConf.networks = {}
