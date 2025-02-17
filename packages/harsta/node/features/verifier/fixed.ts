import { UpgradesError } from '@openzeppelin/upgrades-core'

let isFixed = false
export function fixedLinkingErrorLogger(console: any) {
  if (isFixed)
    return
  isFixed = true

  const errorLogger = console.error
  const logLogger = console.log
  let isLinking = false

  console.log = (...data: any[]) => {
    if (typeof data[0] === 'string' && data[0].startsWith('Linking proxy ')) {
      isLinking = true
    }
    return logLogger(...data)
  }

  console.error = (...data: any[]) => {
    if (data[0] instanceof UpgradesError && isLinking) {
      isLinking = false
      console.warn('Linking proxy failed, skip proxy link with implementation')
      console.log()
      return
    }
    return errorLogger(...data)
  }
}
