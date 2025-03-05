/* eslint-disable ts/no-require-imports */
require('@nomicfoundation/hardhat-toolbox')
require('@openzeppelin/hardhat-upgrades')
require('hardhat-abi-exporter')

const { userConf } = require('./dist/constants')
const { transformHarstaConfigToHardhat } = require('./dist/transform')

const config = transformHarstaConfigToHardhat(userConf.default || userConf)

module.exports = config
