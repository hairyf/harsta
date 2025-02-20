export function getRuntimeRequiredNetwork(defaultValue?: string) {
  const network = defaultValue || process.env.NETWORK
  if (!network)
    throw new Error('The network field is missing. You can set it from process.env Network or Set option')
  process.env.NETWORK = network
  return network
}
