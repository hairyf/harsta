import type { Chain } from '../types'

export function proxy<T extends object>(initObject?: T) {
  initObject && Reflect.set(initObject, 'proxyUpdated', true)
  let target: any = initObject || { proxyUpdated: false }
  const proxy = new Proxy<any>({}, {
    get: (_, p) => {
      return typeof target?.[p] === 'function'
        ? target?.[p].bind(target)
        : target?.[p]
    },
    set: (_, p, v) => {
      target[p] = v
      return true
    },
  }) as T
  function update(object?: T) {
    if (!object) {
      target = undefined
      return
    }
    Reflect.set(object, 'proxyUpdated', true)
    target = object
  }
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

export function isChain(value: any): value is Chain {
  return Boolean(value.name || value.rpcUrls || value.id)
}

proxy.resolve = <T extends object>(target: T): T | undefined => {
  return Reflect.get(target, 'proxyUpdated') ? target : undefined
}
