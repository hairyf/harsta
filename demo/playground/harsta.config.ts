import type { HarstaRuntimeEnvironment } from 'harsta'
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
  solidity: '0.8.24',
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
    DoitRingDevice: { mode: 'uups', args: getVerifieArgs },
    DoitRingStaked: { mode: 'uups', args: getOwnableArgs },
    Health: { args: getOwnableArgs },
  },
})

async function getVerifieArgs(env: HarstaRuntimeEnvironment) {
  return env.getNamedAccounts().then(ns => [ns.owner, ns.verifier])
}
async function getOwnableArgs(env: HarstaRuntimeEnvironment) {
  return env.getNamedAccounts().then(ns => [ns.owner])
}

export default config
