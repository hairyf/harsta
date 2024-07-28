import { defineConfig } from 'harsta'

import 'dotenv/config'

const config = defineConfig({
  solidity: '0.8.24',
  networks: {},
  deployments: {
    Storage: { update: 'proxy' },
    Lock: {},
  },
})

export default config
