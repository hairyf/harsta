import { JsonRpcServer } from 'hardhat/internal/hardhat-network/jsonrpc/server'
import type { EthereumProvider, HardhatConfig } from 'hardhat/types'
import fs from 'fs-extra'
import consola from 'consola'

export interface ServerOptions {
  host?: string
  port?: number
}

export async function createServer(config: HardhatConfig, provider: EthereumProvider, options?: ServerOptions) {
  const server = new JsonRpcServer({
    ...defaultOptions(),
    ...options,
    provider,
  })

  const actual = await server.listen()

  consola.start(`Started HTTP and WebSocket JSON-RPC server at http://${actual.address}:${actual.port}/`)

  return server
}
function defaultOptions() {
  const hostname = fs.existsSync('/.dockerenv')
    ? '0.0.0.0'
    : '127.0.0.1'
  const port = process.env.GANACHE_PORT !== undefined
    ? Number(process.env.GANACHE_PORT)
    : 8545
  return { hostname, port }
}
