import { defineConfig } from 'harsta'
import { Wallet } from 'ethers'
import 'dotenv/config'

const deploy = {
  accounts: [
    process.env.OWNER_PRIVATE_KEY || Wallet.createRandom().privateKey,
    process.env.VERIFIER_PRIVATE_KEY || Wallet.createRandom().privateKey,
  ],
  saveDeployments: true,
  allowUnlimitedContractSize: true,
  gas: 'auto',
  gasPrice: 'auto',
}

const currency = {
  decimals: 18,
  name: 'MXC Token',
  symbol: 'MXC',
}

const config = defineConfig({
  solidity: {
    version: '0.8.24',
    settings: {
      evmVersion: 'shanghai',
    },
  },
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
      deploy: deploy as any,
      verify: { uri: 'https://geneva-explorer-v1.moonchain.com' },
    },
    moonchain: {
      name: 'Moonchain',
      rpc: 'https://rpc.mxc.com',
      id: 18686,
      icon: 'https://raw.githubusercontent.com/MXCzkEVM/metadata/main/logo-circle.svg',
      currency,
      explorer: {
        name: 'etherscan',
        url: 'https://explorer.moonchain.com',
      },
      deploy: deploy as any,
      verify: { uri: 'https://explorer-v1.moonchain.com' },
    },
  },
  deployments: {
    ERC20: {
      target: 'ERC20WithOwnable',
      args: async (env) => {
        const ns = await env.getNamedAccounts()
        return [ns.owner, 'TestName1', 'TestSymbol1']
      },
    },
    ERC20WithTransparent: {
      kind: 'transparent',
      args: async (env) => {
        const ns = await env.getNamedAccounts()
        return [ns.owner, 'TestName2', 'TestSymbol2']
      },
    },
    ERC20WithUUPS: {
      kind: 'uups',
      args: async (env) => {
        const ns = await env.getNamedAccounts()
        return [ns.owner, 'TestName2', 'TestSymbol2']
      },
    },
  },
})

// # deploy and verify all contracts
// harsta deploy --verify

// # verify select contract
// harsta verify contract1

export default config
