import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-verify'
import '@openzeppelin/hardhat-upgrades'
import 'hardhat-abi-exporter'
import 'hardhat-deploy'
import 'dotenv/config'

import { transformHarstaConfigToHardhat } from './node/config/transform'

import { userConf } from './node/constants'

const config = transformHarstaConfigToHardhat(userConf)

export default config
