import { JsonRpcServer } from 'hardhat/internal/hardhat-network/jsonrpc/server'
import type { EthereumProvider } from 'hardhat/types'
import { existsSync } from 'fs-extra'
import consola from 'consola'

export interface JsonServerOptions {
  host?: string
  port?: number
}

export async function createServer(provider: EthereumProvider, options?: JsonServerOptions) {
  const defaultServerOptions = {
    port: process.env.GANACHE_PORT !== undefined ? Number(process.env.GANACHE_PORT) : 8545,
    hostname: existsSync('/.dockerenv') ? '0.0.0.0' : '127.0.0.1',
  }
  const server = new JsonRpcServer({
    ...defaultServerOptions,
    ...options,
    provider,
  })

  const actual = await server.listen()

  consola.start(`Started HTTP and WebSocket JSON-RPC server at http://${actual.address}:${actual.port}/`)

  return server
}
