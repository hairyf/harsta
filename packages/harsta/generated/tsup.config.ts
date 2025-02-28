import { defineConfig } from 'tsup'
import pkg from '../package.json'

export default defineConfig(() => {
  return {
    entry: [
      './',
      '!mod-react.d.ts',
      '!tsup.config.ts',
      '!mod-wagmi.d.ts',
      '!tsconfig.json',
    ],
    dts: false,
    format: ['cjs', 'esm'],
    splitting: true,
    minify: false,
    external: [
      /react/,
      /wagmi/,
      ...Object.keys(pkg.devDependencies || {}),
      ...Object.keys(pkg.dependencies || {}),
    ],
  }
})
