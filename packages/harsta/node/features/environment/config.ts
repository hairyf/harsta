import { HARDHAT_NETWORK_NAME } from 'hardhat/plugins'
import { hardhatConf } from '../../constants'
import type { NetworkUserConfig } from '../../types'

export const DEFAULT_HARDHAT_NETWORK_CONFIG: NetworkUserConfig = {
  currency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  id: hardhatConf.networks.hardhat.chainId,
  name: HARDHAT_NETWORK_NAME,
  testnet: true,
} as any
