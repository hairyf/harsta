import type { Chain } from '../types'

export function proxy<T extends object>(initObject?: T) {
  let target: any = { proxyUpdated: false }
  const proxy = new Proxy<any>({}, {
    get: (_, p) => {
      return target?.[p] === 'function'
        ? target?.[p].bind(target)
        : target?.[p]
    },
    set: (_, p, v) => {
      target[p] = v
      return true
    },
  }) as T

  function update(object: T) {
    if (!object)
      throw new Error('proxy update called on non-object')
    Reflect.set(object, 'proxyUpdated', true)
    target = object
  }

  initObject && update(initObject)

  return {
    proxy,
    update,
  }
}

export function getter<T extends object>(get: () => T) {
  const proxy = new Proxy<any>({}, {
    get: (_, p) => {
      const target = get() as any
      return target?.[p] === 'function'
        ? target?.[p].bind(target)
        : target?.[p]
    },
    set: (_, p, v) => {
      const target = get() as any
      target[p] = v
      return true
    },
  }) as T
  return proxy
}

proxy.resolve = <T extends object>(target: T): T | undefined => {
  return Reflect.get(target, 'proxyUpdated') ? target : undefined
}

export function isChain(value: any): value is Chain {
  return Boolean(value.name || value.rpcUrls || value.id)
}
