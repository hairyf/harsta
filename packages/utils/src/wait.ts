import { TransactionResponse, TransactionReceipt } from 'ethers'

function waitForTransaction(transaction: () => TransactionResponse | TransactionReceipt | Promise<TransactionReceipt | TransactionResponse>): Promise<TransactionReceipt | null>
function waitForTransaction(transaction: TransactionResponse | Promise<TransactionResponse>): Promise<TransactionReceipt | null>
async function waitForTransaction(transaction: any): Promise<any> {
  all.before.forEach((callback) => callback())
  let receipt: TransactionReceipt | null = null
  try {
    if (typeof transaction.then !== 'function')
      transaction = await Promise.resolve(transaction)
    if (transaction.wait)
      transaction = await transaction.wait()
    receipt = transaction
  } catch (error) {
    all.after.forEach((callback) => callback(error))
    return receipt
  }
  all.after.forEach((callback) => callback(receipt!))
  return receipt
}

const all = {
  before: [] as Function[],
  after: [] as Function[],
}

function subscribe(type: 'before', callback: () => void): void
function subscribe(type: 'after', callback: (receipt: TransactionReceipt | Error) => void): void
function subscribe(type: string, callback: Function) {
  if (type === 'before')
    all.before.push(callback)
  else 
    all.after.push(callback)
}

waitForTransaction.subscribe = subscribe