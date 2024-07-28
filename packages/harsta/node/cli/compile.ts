import path from 'pathe'
import fs from 'fs-extra'
import { glob, runTypeChain } from 'typechain'
import type { Argv } from 'yargs'
import consola from 'consola'
import { dim } from 'kolorist'
import { findDepthFilePaths } from '../utils'
import type { Chain } from '../types'
import { clientRoot, packRoot, userConf, userRoot } from '../constants'
import { exec, hardhatBinRoot, ptsupBinRoot } from './utils'

export function registerCompileCommand(cli: Argv) {
  cli.command(
    'compile',
    'Compile and output the dist directory',
    args => args
      .option('output', {
        describe: 'output directory, default output to @harsta/client, if not installed, output dist',
        alias: 'o',
        type: 'string',
      })
      .option('clean', {
        deprecate: 'Clears the cache and deletes all artifacts',
        alias: 'c',
        type: 'boolean',
      })
      .help(),
    async (args) => {
      const generateRoot = path.resolve(packRoot, './generated')

      await fs.remove(path.resolve(packRoot, './contracts'))
      await fs.remove(path.resolve(generateRoot, './contracts'))
      await fs.remove(path.resolve(generateRoot, './fragments'))
      await fs.copy(
        path.resolve(userRoot, './contracts'),
        path.resolve(packRoot, './contracts'),
      )
      args.clean && exec(`node ${hardhatBinRoot} clean`)
      exec(`node ${hardhatBinRoot} compile`)
      exec(`node ${hardhatBinRoot} export-abi`)

      function presolve(_path: string) {
        return path.resolve(generateRoot, _path)
      }

      const fragmentsExtendsPaths = findDepthFilePaths(path.resolve(userRoot, './config/fragments'))
      const fragmentsPaths = findDepthFilePaths(presolve('./fragments'))
        .filter(p => !p.endsWith('index.ts'))
        .filter(p => !fragmentsExtendsPaths.some(ep => path.basename(p) === path.basename(ep)))

      await Promise.all([
        buildAddresses(),
        buildChains(),
        buildFragmentsIndex(),
        buildInterfaces(),
        buildContracts(),
        buildContractsExtends(),
      ])

      const defaultOutput = clientRoot ? path.resolve(clientRoot, 'build') : path.resolve(userRoot, 'dist')
      const output = args.output ? (path.isAbsolute(args.output) ? args.output : path.resolve(userRoot, args.output)) : undefined
      exec(`node ${ptsupBinRoot} ${generateRoot} --dts --clean --outdir ${output || defaultOutput}`)

      const dir = path.resolve(output || defaultOutput, '../')
      const log = dir.endsWith('@harsta/client')
        ? '@harsta/client'
        : path.dirname(dir)
      consola.log(`\n✔ Generated Harsta Client ${dim(`to ${log}`)}\n`)

      async function buildAddresses() {
        const userAddressesPath = path.resolve(userRoot, './config/addresses.ts')
        const packAddressesPath = path.resolve(generateRoot, './addresses/index.ts')
        if (!fs.existsSync(userAddressesPath)) {
          await fs.ensureDir(path.dirname(userAddressesPath))
          await fs.writeFile(userAddressesPath, 'export default {\n\n}\n')
        }
        await fs.ensureDir(path.dirname(packAddressesPath))
        await fs.copy(userAddressesPath, packAddressesPath)
      }

      async function buildContractFactories(
        paths: string[],
        outdir: string,
        typechainsPath: string,
        suffixRows: string[] = [],
      ) {
        await fs.ensureDir(outdir)

        const indexRows: string[] = []

        for (const p of paths) {
          const name = path.basename(p).replace('.json', '')
          const file = path.resolve(outdir, p).replace('.json', '.ts')
          const dirname = path.dirname(file)
          const fileRows = [
            `import { ${name}__factory } from '${path.relative(dirname, typechainsPath)}'`,
            `import { resolveAddress, resolveRunner } from '${path.relative(dirname, presolve('./utils'))}'`,
            `import type { Runner } from '${path.relative(dirname, presolve('./types'))}'`,
            '',
            `export class ${name} {`,
            `  static abi = ${name}__factory.abi`,
            '',
            '  static interface() {',
            `    return ${name}__factory.createInterface()`,
            '  }',
            '',
            '  static attach(address: string, runner?: Runner) {',
            `    return ${name}__factory.connect(address, resolveRunner(runner))`,
            '  }',
            '',
            `  static resolve(runner?: Runner, address?: string) {`,
            `    const resolvedRunner = resolveRunner(runner)`,
            `    const target = address || resolveAddress(this.name, resolvedRunner)`,
            `    return ${name}__factory.connect(target, resolvedRunner)`,
            `  }`,
            '}',
          ]
          await fs.ensureDir(dirname)
          await fs.writeFile(file, fileRows.join('\n'))
          const exportFile = file.replace('.ts', '')
          const exportPath = path.relative(outdir, exportFile)
          indexRows.push(`export { ${name} } from './${exportPath.replace(/\\/g, '/')}'`)
        }

        indexRows.push(...suffixRows)

        indexRows.push('')

        await fs.writeFile(path.resolve(outdir, './index.ts'), indexRows.join('\n'))
      }

      async function buildChains() {
        const chainsDir = presolve('./chains')
        await fs.ensureDir(chainsDir)
        const indexRows: string[] = []
        for (const alias in userConf.networks) {
          const network = userConf.networks[alias]
          if (!network)
            return
          const chain: Chain = {
            id: network.id,
            name: network.name,
            nativeCurrency: network.currency,
            rpcUrls: {
              default: { http: [network.rpc] },
              public: { http: [network.rpc] },
            },
            ...(network.explorer
              ? { blockExplorers: { default: network.explorer } }
              : {}),
            iconUrl: network?.icon,
            testnet: network.testnet,
          }
          indexRows.push(`export const ${alias} = ${JSON.stringify(chain, null, 2)} as const\n`)
        }
        if (!indexRows.length)
          indexRows.push('export {}')
        await fs.writeFile(path.resolve(chainsDir, './index.ts'), indexRows.join('\n'))
      }

      async function buildFragmentsIndex() {
        const indexRows: string[] = []

        for (const p of fragmentsPaths) {
          const name = path.basename(p).replace('.json', '')
          indexRows.push(`export { default as ${name}Fragment } from './${p}'`)
        }
        indexRows.push('')
        await fs.ensureDir(presolve('./fragments'))
        await fs.writeFile(path.resolve(presolve('./fragments'), './index.ts'), indexRows.join('\n'))
      }

      async function buildContracts() {
        await buildContractFactories(
          fragmentsPaths,
          presolve('./contracts'),
          presolve('./typechains'),
          ['', `export * from './extends'`],
        )
      }

      async function buildContractsExtends() {
        if (!fragmentsExtendsPaths.length) {
          await fs.ensureDir(presolve('./contracts/extends'))
          await fs.writeFile(presolve('./contracts/extends/index.ts'), 'export {}\n')
          return
        }

        const allFiles = glob(userRoot, ['./config/fragments/*.json'])
        await runTypeChain({
          cwd: userRoot,
          allFiles,
          filesToProcess: allFiles,
          target: 'ethers-v6',
          outDir: presolve('./typechains/extends'),
        })

        await buildContractFactories(
          fragmentsExtendsPaths,
          presolve('./contracts/extends'),
          presolve('./typechains/extends'),
        )
      }

      async function buildInterfaces() {
        const rows = [
          ...fragmentsPaths.map((p) => {
            const name = path.basename(p).replace('.json', '')
            return `export type { ${name} } from '../typechains'`
          }),
          '',
          ...fragmentsExtendsPaths.map((p) => {
            const name = path.basename(p).replace('.json', '')
            return `export type { ${name} } from '../typechains/extends'`
          }),
        ]

        await fs.ensureDir(presolve('./interfaces'))
        await fs.writeFile(presolve('./interfaces/index.ts'), rows.join('\n'))
      }
    },
  )
}
