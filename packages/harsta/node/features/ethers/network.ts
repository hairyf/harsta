import { HARDHAT_NETWORK_NAME } from 'hardhat/plugins'
import { hardhatConf, userConf } from '../../constants'

if (!userConf.networks)
  userConf.networks = {}

userConf.networks[HARDHAT_NETWORK_NAME] = {
  currency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  id: hardhatConf.networks.hardhat.chainId,
  name: HARDHAT_NETWORK_NAME,
  testnet: true,
} as any
