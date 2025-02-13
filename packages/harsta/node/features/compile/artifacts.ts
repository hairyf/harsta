import { Artifacts } from 'hardhat/internal/artifacts'
import { hardhatConf } from '../../constants'

export const artifacts = new Artifacts(hardhatConf.paths.artifacts)
