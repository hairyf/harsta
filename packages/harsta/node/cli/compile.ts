import path from 'pathe'
import fs from 'fs-extra'
import { glob, runTypeChain } from 'typechain'
import type { Argv } from 'yargs'
import consola from 'consola'
import { dim } from 'kolorist'
import { resolveUserPath } from '../utils'
import type { Chain } from '../types'
import { clientRoot, packRoot, userConf, userRoot } from '../constants'
import { exec, hardhatBinRoot, resolveFragmentsPaths, resolveUserAddresses, tscBinRoot } from './utils'

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
      if (userConf.paths?.fragments) {
        await fs.remove(path.join(resolveUserPath(userConf.paths.fragments)!, './@openzeppelin'))
        await fs.remove(path.join(resolveUserPath(userConf.paths.fragments)!, './contracts'))
      }

      await fs.copy(
        path.resolve(userRoot, './contracts'),
        path.resolve(packRoot, './contracts'),
      )
      args.clean && exec(`node ${hardhatBinRoot} clean`)
      exec(`node ${hardhatBinRoot} compile`)
      exec(`node ${hardhatBinRoot} export-abi`)

      const allFiles = glob(userRoot, ['./config/fragments/*.json'])
      await runTypeChain({
        cwd: userRoot,
        allFiles,
        filesToProcess: allFiles,
        target: 'ethers-v6',
        outDir: resolveGenerate('./typechains/extends'),
      })

      function resolveGenerate(_path: string) {
        return path.resolve(generateRoot, _path)
      }

      const [fragmentsPaths, fragmentsExtendsPaths] = resolveFragmentsPaths()

      await Promise.all([
        buildAddresses(),
        buildChains(),
        buildFragments(),
        buildContractsExtends(),
        buildContracts(),
      ])

      await buildTypes()

      const defaultOutput = clientRoot ? path.resolve(clientRoot, 'build') : path.resolve(userRoot, 'dist')
      const output = args.output ? (path.isAbsolute(args.output) ? args.output : path.resolve(userRoot, args.output)) : undefined
      const generateTsconfig = path.resolve(generateRoot, './tsconfig.json')
      const outdir = output || defaultOutput

      exec(`node ${tscBinRoot} --declaration --outDir ${outdir} --project ${generateTsconfig}`, generateRoot)

      const dir = path.resolve(outdir, '../')
      const log = dir.endsWith('@harsta/client')
        ? '@harsta/client'
        : path.dirname(dir)
      consola.log(`\n✔ Generated Harsta Client ${dim(`to ${log}`)}\n`)

      async function buildAddresses() {
        const packAddressesPath = path.resolve(generateRoot, './addresses/index.ts')
        const addresses = await resolveUserAddresses()
        await fs.ensureDir(path.dirname(packAddressesPath))
        await fs.writeFile(packAddressesPath, addresses)
      }

      async function buildContractFactories(
        paths: typeof fragmentsExtendsPaths,
        outdir: string,
        typechainsPath: string,
        suffixRows: string[] = [],
      ) {
        await fs.ensureDir(outdir)

        const indexRows: string[] = []

        for (const { outfile, input } of paths) {
          const { name, dirname, file } = outfile
          const fileRows = [
            `import { ${name}__factory } from '${path.relative(dirname, typechainsPath)}'`,
            `import { resolveAddress, resolveRunner } from '${path.relative(dirname, resolveGenerate('./utils'))}'`,
            `import type { Runner } from '${path.relative(dirname, resolveGenerate('./types'))}'`,
            `import { ${name}, ${name}Interface } from '${input.import}'`,
            '',
            `export type { ${name}, ${name}Interface }`,
            '',
            `export class ${name}Factory {`,
            `  static abi = ${name}__factory.abi`,
            '',
            `  static interface(): ${name}Interface {`,
            `    return ${name}__factory.createInterface()`,
            '  }',
            '',
            `  static attach(address: string, runner?: Runner): ${name} {`,
            `    return ${name}__factory.connect(address, resolveRunner(runner))`,
            '  }',
            '',
            `  static resolve(runner?: Runner, address?: string): ${name} {`,
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
          indexRows.push(`export { ${name}Factory as ${name} } from './${exportPath.replace(/\\/g, '/')}'`)
        }

        indexRows.push(...suffixRows)

        indexRows.push('')

        await fs.writeFile(path.resolve(outdir, './index.ts'), indexRows.join('\n'))
      }

      async function buildChains() {
        const chainsDir = resolveGenerate('./chains')
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

      async function buildFragments() {
        const indexRows: string[] = []

        for (const { outfile, path } of fragmentsPaths) {
          indexRows.push(`export { default as ${outfile.name}Fragment } from './${path}'`)
        }
        if (!indexRows.length)
          indexRows.push('export {}')
        indexRows.push('')
        await fs.ensureDir(resolveGenerate('./fragments'))
        if (userConf.paths?.fragments) {
          await fs.copy(
            path.resolve(generateRoot, './fragments'),
            resolveUserPath(userConf.paths.fragments)!,
          )
        }
        await fs.writeFile(path.resolve(resolveGenerate('./fragments'), './index.ts'), indexRows.join('\n'))
      }

      async function buildContracts() {
        await buildContractFactories(
          fragmentsPaths,
          resolveGenerate('./contracts'),
          resolveGenerate('./typechains'),
          ['', `export * from './extends'`],
        )
      }

      async function buildContractsExtends() {
        if (!fragmentsExtendsPaths.length) {
          await fs.ensureDir(resolveGenerate('./contracts/extends'))
          await fs.writeFile(resolveGenerate('./contracts/extends/index.ts'), 'export {}\n')
          return
        }

        await buildContractFactories(
          fragmentsExtendsPaths,
          resolveGenerate('./contracts/extends'),
          resolveGenerate('./typechains/extends'),
        )
      }

      async function buildTypes() {
        const paths = [...fragmentsPaths, ...fragmentsExtendsPaths] as typeof fragmentsPaths
        const types = [
          {
            type: 'events',
            filter: (mod: string) => mod.endsWith('Event'),
            outfile: './events/index.ts',
          },
          {
            type: 'interfaces',
            filter: (mod: string) => mod.endsWith('Interface'),
            outfile: './interfaces/index.ts',
          },
          {
            type: 'instances',
            filter: (mod: string, name: string) => mod === name,
            outfile: './instances/index.ts',
          },
        ]

        for (const config of types) {
          const outfile = path.resolve(generateRoot, config.outfile)
          const dirname = path.dirname(outfile)

          await fs.remove(dirname)
          await fs.ensureDir(dirname)

          function resolve({ input, outfile: { name } }: typeof paths[number]) {
            const exports = input.exports.filter(mod => config.filter(mod, name)) || []
            const importPath = `${path.relative(dirname, input.typechains)}/${input.relative}`
            return `export type { ${exports.join(', ')} } from '${importPath}'`
          }
          if (config.type !== 'events') {
            const rows = paths.map(resolve)
            await fs.writeFile(outfile, rows.join('\n'))
            continue
          }
          for (const p of paths) {
            const outfile = path.resolve(dirname, `${p.outfile.name}.ts`)
            await fs.writeFile(outfile, resolve(p))
          }
          const indexRows = paths
            .map(p => p.outfile.name)
            .map(name => `export * as ${name} from './${name}'`)
          await fs.writeFile(outfile, indexRows.join('\n'))
        }
      }
    },
  )
}
