import { defineConfig } from 'tsdown'
import pkg from '../package.json'

export default defineConfig({
  entry: [
    './**/*.ts',
    '!tsdown.config.ts',
  ],
  dts: false,
  format: ['cjs', 'esm'],
  minify: false,
  external: [
    /react/,
    'wagmi',
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
  ],
})
