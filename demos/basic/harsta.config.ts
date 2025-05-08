import { defineConfig } from 'harsta'

const config = defineConfig({
  paths: {
    sources: './src/contracts',
    exports: './exports',
    config: './src/config',
  },
  solidity: {
    settings: { evmVersion: 'shanghai' },
    version: '0.8.24',
  },
})

export default config
