import { createJiti } from 'jiti'
import { resolve } from 'pathe'
import consola from 'consola'

export type UserInputConfig = Record<string, any>
export interface ResolvedConfig<
  T extends UserInputConfig = UserInputConfig,
> {
  config: T
  configFile: string
}

export function loadConfig<T extends UserInputConfig = UserInputConfig>(options: {
  name: string
  cwd: string
}): ResolvedConfig<T> {
  const { name, cwd } = options
  const filePath = resolve(cwd, `${name}.config.ts`)

  let data = {} as T

  try {
    const jiti = createJiti(__dirname, { interopDefault: true })
    data = jiti(filePath)
  }
  catch (error) {
    consola.log(error)
    consola.debug(`Failed to load config file: ${filePath}`)
  }

  return {
    config: data,
    configFile: filePath,
  }
}
