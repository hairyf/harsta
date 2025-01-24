import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      'packages/harsta/generated/typechains/*',
      'packages/harsta/generated/interfaces/*',
      'packages/harsta/generated/fragments/*',
      'packages/harsta/generated/addresses/*',
      'packages/harsta/generated/chains/*',
      'packages/harsta/generated/contracts/*',
      'packages/harsta/deploy/*',
    ],
    typescript: true,
  },
  {
    rules: {
      'node/prefer-global/process': 'off',
      'ts/no-unused-expressions': 'off',
      'antfu/no-import-dist': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
    },
  },
)
