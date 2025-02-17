/* eslint-disable no-console */
import type { LibraryToAddress } from '@nomicfoundation/hardhat-verify/internal/solc/artifacts'
import { environment } from '../imports'
import { fixedLinkingErrorLogger } from './fixed'

export interface VerifyOptions {
  libraries?: LibraryToAddress
  arguments?: any[]
  contract?: string
  force?: boolean
}

export async function verify(address: string, options: VerifyOptions = {}) {
  fixedLinkingErrorLogger(console)
  const config = Object.assign({ address }, {
    constructorArguments: options.arguments,
    libraries: options.libraries,
    contract: options.contract,
    force: options.force,
  })

  await environment.env.run('verify:verify', config).catch((error) => {
    console.log('')
    return error
  })
}
