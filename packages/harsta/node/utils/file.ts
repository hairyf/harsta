import fs from 'node:fs'
import path from 'pathe'

export function resolveFileConflicts(paths: string[]): string[] {
  const fileGroups = new Map<string, string[]>()

  for (const filePath of paths) {
    const fileName = path.basename(filePath)
    if (!fileGroups.has(fileName)) {
      fileGroups.set(fileName, [])
    }
    fileGroups.get(fileName)!.push(filePath)
  }

  const newPaths: string[] = []

  for (const [fileName, pathsWithSameName] of fileGroups.entries()) {
    if (pathsWithSameName.length === 1) {
      newPaths.push(pathsWithSameName[0])
      continue
    }
    const externallyPaths = pathsWithSameName.filter(p => p.startsWith('externally/'))
    if (externallyPaths.length === 0) {
      newPaths.push(pathsWithSameName[0])
      continue
    }
    if (externallyPaths.length > 1) {
      const lastedPath = externallyPaths.at(-1)?.replace('externally/', 'fragments/')
      console.warn(`Warning: Multiple files with the same name '${fileName}' found in externally directory. Using the lasted one: ${lastedPath}`)
    }
    newPaths.push(externallyPaths.at(-1)!)
  }

  return newPaths
}

export function findsFilePaths(directory: string) {
  function _findsFilePaths(directory: string, paths: string[] = []) {
    try {
      const files = fs.readdirSync(directory)

      files.forEach((file) => {
        const filePath = path.join(directory, file)
        const fileStat = fs.statSync(filePath)

        if (fileStat.isDirectory()) {
          _findsFilePaths(filePath, paths)
        }
        else {
          paths.push(filePath)
        }
      })
      return paths
    }
    catch {
      return []
    }
  }
  return _findsFilePaths(directory).map(p => path.relative(directory, p))
}

export function findsFuzzFilePaths(directory: string, keyword: string) {
  const files = fs.readdirSync(directory)
  let foundFiles: string[] = []
  files.forEach((file) => {
    const filePath = path.join(directory, file)
    const fileStat = fs.statSync(filePath)

    if (fileStat.isDirectory()) {
      const nestedFiles = findsFuzzFilePaths(filePath, keyword)
      foundFiles = foundFiles.concat(nestedFiles)
    }
    else {
      if (file.includes(keyword))
        foundFiles.push(filePath)
    }
  })
  return foundFiles
}
