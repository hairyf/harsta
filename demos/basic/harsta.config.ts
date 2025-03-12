import { defineConfig } from 'harsta'

const config = defineConfig({
  solidity: {
    settings: { evmVersion: 'shanghai' },
    version: '0.8.24',
  },
})

export default config
