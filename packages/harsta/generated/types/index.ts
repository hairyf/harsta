import type { ContractRunner, Signer } from 'ethers'
import type { Chain as _Chain } from 'viem'

export interface Chain extends _Chain {
  addresses: Record<string, string>
  iconUrl?: string | (() => Promise<string>) | null
  iconBackground?: string
}

export type Runner = ContractRunner | Chain | 'provider' | 'signer'
export type SignRunner = 'signer' | Signer
