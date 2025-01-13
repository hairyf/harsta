export function isString(value: any): value is string {
  return typeof value === 'string'
}
export function isBoolean(value: any): value is boolean {
  return typeof value ==='boolean'
}

export function cover(value: string, mode: [number, number, number], symbol = '*') {
  return value.slice(0, mode[0]) + symbol.repeat(mode[1]) + value.slice(-mode[2])
}
