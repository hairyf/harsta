/* eslint-disable no-console */
import path from 'node:path'
import minimist from 'minimist'
import prompts from 'prompts'
import fs from 'fs-extra'
import { blue, dim, green, reset } from 'kolorist'
import { isValidPackageName, pkgFromUserAgent, toValidPackageName, writeOverwriteJSON } from './utils'

const argv = minimist(process.argv.slice(2))
const cwd = process.cwd()

async function main() {
  const argTargetDir = argv._[0]?.trim().replace(/\/+$/g, '')

  let targetDir = argTargetDir || `harsta-project`
  let result: prompts.Answers<'root' | 'packageName'>

  const getProjectName = () =>
    targetDir === '.' ? path.basename(path.resolve()) : path.basename(targetDir)
  const getRoot = () => path.resolve(cwd, targetDir)
  // TODO
  try {
    result = await prompts([
      {
        type: argTargetDir ? null : 'text',
        name: 'root',
        message: reset('Harsta project root:'),
        initial: '.',
        onState: (state) => {
          targetDir = state.value
        },
      },
      {
        type: () => {
          const isGenPack = !fs.existsSync(getRoot())
            || !fs.existsSync(path.resolve(getRoot(), './package.json'))
          return isGenPack ? 'text' : undefined
        },
        name: 'packageName',
        message: reset('Package name:'),

        initial: () => toValidPackageName(getProjectName()),
        validate: dir =>
          isValidPackageName(dir) || 'Invalid package.json name',
      },
    ])
  }
  catch {
    result = {
      packageName: undefined,
      root: getRoot(),
    }
  }
  const { packageName } = result
  const root = getRoot()
  const templateDir = path.resolve(__dirname, '../template')
  const sourceFile = path.resolve(root, './package.json')
  const packageJSON = await fs.readJson(path.resolve(templateDir, './package.json'))

  await fs.ensureDir(root)

  await fs.copy(
    templateDir,
    root,
    {
      filter: src => !src.endsWith('package.json')
      && !src.endsWith('node_modules'),
    },
  )

  if (packageName) {
    packageJSON.name = packageName
    await fs.writeJSON(sourceFile, packageJSON, { spaces: 2 })
  }
  else {
    writeOverwriteJSON(sourceFile, {
      dependencies: packageJSON.dependencies,
    })
  }

  console.log(`  ${dim(root)}`)

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm'
  const related = path.relative(cwd, root)

  console.log(dim('  start it later by:\n'))
  if (root !== cwd)
    console.log(`  ${green('cd')} ${blue(related)}`)

  switch (pkgManager) {
    case 'yarn':
      console.log(`  ${green('yarn')}`)
      console.log(`  ${green('yarn')} harsta --help`)
      break
    default:
      console.log(`  ${green(pkgManager)} install`)
      console.log(`  ${green(pkgManager)} harsta --help`)
      break
  }
  console.log()
}

main()
