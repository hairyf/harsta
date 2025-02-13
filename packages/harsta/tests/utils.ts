import { userConf } from '../node/constants'

export function resolveInDeployments(chainId?: number, filter?: string[]) {
  const deployments = userConf.deployments || {}

  const array = Object
    .keys(deployments).map((name) => {
      return { name, target: name, ...deployments[name] }
    })
    .filter(item => (item.chains && chainId)
      ? item.chains.includes(chainId)
      : true)
    .filter(item => filter
      ? filter.includes(item.name)
      : true,
    )
  return array
}
