import { defineConfig } from 'harsta'

import 'dotenv/config'

const config = defineConfig({
  solidity: '0.8.24',
  deployments: {
    Storage: { kind: 'transparent' },
    Lock: {},
  },
})

export default config
