import type { HardhatRuntimeEnvironment } from 'harsta'
import { defineConfig } from 'harsta'
import { Wallet } from 'ethers'
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
          Wallet.createRandom().privateKey,
          Wallet.createRandom().privateKey,
        ],
        saveDeployments: true,
        allowUnlimitedContractSize: true,
        gas: 'auto',
        gasPrice: 'auto',
      },
      verify: { uri: 'https://geneva-explorer-v1.mxc.com/api' },
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
