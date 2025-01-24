import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  failOnWarn: false,
  externals: ['@hairy/utils', 'ethers', 'mitt'],
  rollup: {
    emitCJS: true,
  },
})
