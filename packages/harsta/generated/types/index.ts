import type { ContractRunner } from 'ethers'
import type { Chain as _Chain } from 'viem'

export interface Chain extends _Chain {
  iconUrl?: string | (() => Promise<string>) | null
  iconBackground?: string
}

export type Runner = ContractRunner | Chain | 'provider' | 'signer'
