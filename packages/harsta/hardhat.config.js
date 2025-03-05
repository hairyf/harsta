require('@nomicfoundation/hardhat-verify')
require('@openzeppelin/hardhat-upgrades')

require('hardhat-abi-exporter')

require('@typechain/hardhat')
require('@typechain/ethers-v6')

const { userConf } = require('./dist/constants')
const { transformHarstaConfigToHardhat } = require('./dist/transform')

const config = transformHarstaConfigToHardhat(userConf.default || userConf)

module.exports = config
