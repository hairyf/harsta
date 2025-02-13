/* eslint-disable ts/ban-ts-comment */
import { JsonRpcProvider, Network } from 'ethers'
import { defaultChain, defaults } from '../defaults'
import type { Chain } from '../types'
import addresses from '../addresses'

export function proxy<T extends object>(initObject?: T) {
  if (initObject) {
    Reflect.set(initObject, 'proxyUpdated', true)
  }
  let target: any = initObject || { proxyUpdated: false }
  const proxy = new Proxy<any>({}, {
    get: (_, p) => {
      if (typeof target?.[p] === 'function')
        return target?.[p].bind(target)
      return target?.[p]
    },
    set: (_, p, v) => {
      target[p] = v
      return true
    },
  }) as T
  function update(object: T) {
    Reflect.set(object, 'proxyUpdated', true)
    target = object
  }
  return {
    proxy,
    update,
  }
}

proxy.resolve = <T extends object>(target: T): T | undefined => {
  return Reflect.get(target, 'proxyUpdated') ? target : undefined
}

export function isChain(value: any): value is Chain {
  return Boolean(value.name || value.rpcUrls || value.id)
}

export function resolveAddress(name: string, runner: any): string {
  if (!runner)
    return undefined as any
  let chainId: number

  try {
    chainId = Number(runner.provider._network.chainId)
  }
  catch {
    chainId = Reflect.get(runner, 'chainId')
  }
  // @ts-expect-error
  return addresses?.[chainId || defaultChain?.id]?.[name]
}

export function resolveDefaultProvider() {
  const chain = defaults.chain as any
  if (!chain)
    return
  const defaultNetwork = new Network(chain?.name, chain.id)
  const defaultProvider = new JsonRpcProvider(chain?.rpcUrls.default.http[0], defaultNetwork)
  Reflect.set(defaultProvider, 'chainId', chain?.id)
  return defaultProvider
}
