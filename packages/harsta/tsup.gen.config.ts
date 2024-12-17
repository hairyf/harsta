import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig((options) => {
  return {
    entry: [
      '!generated/**/mod-react.d.ts',
      '!generated/**/mod-wagmi.d.ts',
      '!generated/**/tsconfig.json',
    ],
    dts: false,
    format: ['cjs', 'esm'],
    splitting: true,
    minify: !options.watch,
    external: [
      ...Object.keys(pkg.devDependencies || {}),
      ...Object.keys(pkg.dependencies || {}),
    ],
  }
})
