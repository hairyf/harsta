import path from 'pathe'
import { dim } from 'kolorist'
import fs from 'fs-extra'
import consola from 'consola'
import { clientRoot, generatedRoot, userRoot } from '../../constants'
import { tscBinRoot, tsupBinRoot } from './roots'
import { exec } from './child_process'

export async function buildDistributed(args: { clean?: boolean, output?: string }) {
  if (args.output === 'ONLY_COMPILE')
    return
  const defaultOutput = clientRoot ? path.resolve(clientRoot, 'build') : path.resolve(userRoot, 'dist')
  const output = args.output ? (path.isAbsolute(args.output) ? args.output : path.resolve(userRoot, args.output)) : undefined
  const outdir = output || defaultOutput

  args.clean && await fs.remove(outdir)

  exec(`node ${tsupBinRoot} --outDir ${outdir}`, { stdio: 'ignore', cwd: generatedRoot })
  exec(`node ${tscBinRoot} --outDir ${outdir}`, { cwd: generatedRoot })

  const log = path.resolve(outdir, '../').endsWith('@harsta/client') ? '@harsta/client' : outdir
  consola.log(`\n✔ Generated Harsta Client ${dim(`to ${log}`)}\n`)
}
