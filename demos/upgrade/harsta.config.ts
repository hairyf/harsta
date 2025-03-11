import { defineConfig } from 'harsta'
import { Wallet } from 'ethers'
import 'dotenv/config'

const config = defineConfig({
  solidity: {
    settings: { evmVersion: 'shanghai' },
    version: '0.8.24',
  },
  namedAccounts: {
    owner: { default: 0 },
    deployer: { default: 0 },
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
          process.env.OWNER_PRIVATE_KEY || Wallet.createRandom().privateKey,
          process.env.VERIFIER_PRIVATE_KEY || Wallet.createRandom().privateKey,
        ],
        saveDeployments: true,
        allowUnlimitedContractSize: true,
        gas: 'auto',
        gasPrice: 'auto',
      },
      verify: {
        uri: 'https://geneva-explorer-v1.moonchain.com',
      },
    },
  },
  deployments: {
    ERC20: {
      target: 'ERC20WithOwnable',
      args: async ({ getNamedAccount }) => {
        return [await getNamedAccount('owner'), 'TestName1', 'TestSymbol1']
      },
    },
    ERC20WithTransparent: {
      kind: 'transparent',
      args: async ({ getNamedAccount }) => {
        return [await getNamedAccount('owner'), 'TestName1', 'TestSymbol1']
      },
    },
    ERC20WithUUPS: {
      kind: 'uups',
      args: async ({ getNamedAccount }) => {
        return [await getNamedAccount('owner'), 'TestName1', 'TestSymbol1']
      },
    },
  },
})

export default config
