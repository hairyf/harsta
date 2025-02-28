import type { ContractFactory, ContractTransactionResponse, TransactionReceipt } from 'ethers'
import { wait } from '../../utils'

export async function waitForDeplTrans(
  [factory, args]: [ContractFactory, unknown[]] | [ContractFactory],
  confirming?: (transaction: ContractTransactionResponse, args: any[]) => void,
  confirmed?: (address: string, receipt: TransactionReceipt) => void,
) {
  const contract = await factory.deploy(...(args || []))
  const transaction = contract.deploymentTransaction()

  if (!transaction)
    throw new Error('Error: transaction send failed')

  confirming?.(transaction, args || [])

  const receipt = await wait(transaction)

  if (!receipt)
    throw new Error('Error: transaction confirm failed')

  confirmed?.(receipt.contractAddress!, receipt)

  return {
    contract,
    transaction,
    receipt,
    args,
    address: receipt.contractAddress!,
  }
}
export async function waitForCallTrans(
  [method, args]: [any, any[]] | [any],
  confirming?: (transaction: ContractTransactionResponse, args: any[]) => void,
  confirmed?: (receipt: TransactionReceipt) => void,
) {
  const transaction = await method(...(args || []))

  if (!transaction)
    throw new Error('Error: transaction send failed')

  confirming?.(transaction, args || [])

  const receipt = await wait(transaction)

  if (!receipt)
    throw new Error('Error: transaction confirm failed')

  confirmed?.(receipt)

  return {
    transaction,
    receipt,
    args,
  }
}
