require('@nomicfoundation/hardhat-toolbox')
require('@nomicfoundation/hardhat-verify')
require('@openzeppelin/hardhat-upgrades')
require('hardhat-abi-exporter')
require('hardhat-deploy')
require('dotenv/config')

const { userConf } = require('./dist/constants')
const { transformHarstaConfigToHardhat } = require('./dist/transform')

const config = transformHarstaConfigToHardhat(userConf)

module.exports = config
