import type { ProviderForkingConfig } from '../../features/network'

export function getRuntimeRequiredNetwork(defaultValue?: string, forking?: ProviderForkingConfig) {
  const network = defaultValue || process.env.NETWORK
  if (!network)
    throw new Error('The network field is missing. You can set it from process.env Network or Set option')
  process.env.NETWORK = network

  process.env.FORK = `${forking?.fork || ''}`
  process.env.FORK_BLOCK_NUMBER = `${forking?.forkBlockNumber || ''}`

  return network
}
