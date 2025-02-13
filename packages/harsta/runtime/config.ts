import path from 'node:path'
import { resolveConfig } from 'hardhat/internal/core/config/config-resolution'
import { normalizeHardhatNetworkAccountsConfig } from 'hardhat/internal/core/providers/util'
import { Wallet } from 'ethers'
import { packRoot, userConf } from '../node/constants'
import { transformHarstaConfigToHardhat } from '../node/transform'

export const hardhatConfig = resolveConfig(
  path.resolve(packRoot, 'hardhat.config.ts'),
  transformHarstaConfigToHardhat(userConf),
)

export const privateKeys = resolveProviderKeys()

function resolveProviderKeys() {
  let accounts: string[] = []
  if (process.env.NETWORK! === 'hardhat') {
    accounts = normalizeHardhatNetworkAccountsConfig(hardhatConfig.networks[process.env.NETWORK!].accounts)
      .map(account => account.privateKey)
  }
  else {
    accounts = userConf.networks?.[process.env.NETWORK!]?.deploy?.accounts || []
  }
  return accounts.reduce((value, key) => {
    value[new Wallet(key).address] = key
    return value
  }, {} as Record<string, string>)
}
