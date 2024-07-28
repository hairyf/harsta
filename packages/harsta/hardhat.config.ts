import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-verify'
import '@openzeppelin/hardhat-upgrades'
import 'hardhat-abi-exporter'
import 'hardhat-deploy'
import 'dotenv/config'

import { transformUserConfigToHardhat } from './node/utils/config'

import { userConf } from './node/constants'

const config = transformUserConfigToHardhat(userConf)

export default config
