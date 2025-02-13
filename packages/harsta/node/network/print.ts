import { JsonRpcServer } from 'hardhat/internal/hardhat-network/jsonrpc/server'
import type { EthereumProvider, HardhatConfig, HardhatNetworkConfig } from 'hardhat/types'
import fs from 'fs-extra'
import { watchCompilerOutput } from 'hardhat/builtin-tasks/utils/watch'
import { HARDHAT_NETWORK_NAME as NETWORK_NAME } from 'hardhat/internal/constants'
import consola from 'consola'
import { HARDHAT_NETWORK_MNEMONIC } from 'hardhat/internal/core/config/default-config'
import { normalizeHardhatNetworkAccountsConfig } from 'hardhat/internal/core/providers/util'
import {
  bytesToHex as bufferToHex,
  privateToAddress,
  toBytes,
  toChecksumAddress,
} from '@nomicfoundation/ethereumjs-util'
import picocolors from 'picocolors'

export function printHardhatNetworkAccounts(config: HardhatConfig) {
  const networkConfig = config.networks[NETWORK_NAME]
  const isDefaultConfig
    = !Array.isArray(networkConfig.accounts)
    && networkConfig.accounts.mnemonic === HARDHAT_NETWORK_MNEMONIC

  consola.log('Accounts')
  consola.log('========')

  if (isDefaultConfig) {
    consola.log('')
    printDefaultConfigWarning()
    consola.log('')
  }

  const accounts = normalizeHardhatNetworkAccountsConfig(
    networkConfig.accounts,
  )

  for (const [index, account] of accounts.entries()) {
    const address = toChecksumAddress(
      bufferToHex(privateToAddress(toBytes(account.privateKey))),
    )

    const balance = (BigInt(account.balance) / 10n ** 18n).toString(10)

    let entry = `Account #${index}: ${address} (${balance} ETH)`

    if (isDefaultConfig) {
      const privateKey = bufferToHex(toBytes(account.privateKey))
      entry += `
Private Key: ${privateKey}`
    }

    consola.log(entry)
    consola.log('')
  }

  if (isDefaultConfig) {
    printDefaultConfigWarning()
    consola.log('')
  }
}

function printDefaultConfigWarning() {
  consola.log(
    picocolors.bold(
      'WARNING: These accounts, and their private keys, are publicly known.',
    ),
  )
  consola.log(
    picocolors.bold(
      'Any funds sent to them on Mainnet or any other live network WILL BE LOST.',
    ),
  )
}
