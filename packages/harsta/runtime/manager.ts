import { createDeploymentsManager } from '../node/features/deploy'
import { lazyEthereumProvider } from './network'

export const manager = createDeploymentsManager(lazyEthereumProvider, process.env.NETWORK!)
