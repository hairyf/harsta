import type { HardhatRuntimeEnvironment } from 'harsta'
import { defineConfig } from 'harsta'
import 'dotenv/config'

const config = defineConfig({
  solidity: '0.8.20',
  defaultNetwork: 'geneva',
  namedAccounts: {
    deployer: { default: 0 },
    owner: { default: 0 },
    verifier: { default: 1 },
  },
  networks: {
    geneva: {
      name: 'Moonchain',
      rpc: 'https://geneva-rpc.moonchain.com',
      testnet: true,
      id: 5167004,
      icon: 'https://raw.githubusercontent.com/MXCzkEVM/metadata/main/logo-circle.svg',
      currency: {
        decimals: 18,
        name: 'MXC Token',
        symbol: 'MXC',
      },
      explorer: {
        name: 'etherscan',
        url: 'https://geneva-explorer.moonchain.com',
      },
      deploy: {
        accounts: [
          '0xfc5e8968576e867a8326048aa6c162fbc03efa8f47b8cd1342dbc1d5cddd3c8b',
          '0xfc5e8968576e867a8326048aa6c162fbc03efa8f47b8cd1342dbc1d5cddd3c8b',
        ],
        saveDeployments: true,
        allowUnlimitedContractSize: true,
        gas: 'auto',
        gasPrice: 'auto',
      },
      verify: { uri: 'https://geneva-explorer-v1.moonchain.com' },
    },
  },
  deployments: {
    Markets: { update: 'uups', args: getOwnableArgs },
    Savings: { update: 'uups', args: getOwnableArgs },
    Storage: { update: 'proxy' },
  },
})

async function getOwnableArgs(env: HardhatRuntimeEnvironment) {
  return env.getNamedAccounts().then(ns => [ns.owner])
}

export default config
