import path from 'node:path'
import fs from 'node:fs'

export function findDepthFilePaths(directory: string) {
  function _findDepthFilePaths(directory: string, paths: string[] = []) {
    try {
      const files = fs.readdirSync(directory)

      files.forEach((file) => {
        const filePath = path.join(directory, file)
        const fileStat = fs.statSync(filePath)

        if (fileStat.isDirectory()) {
          _findDepthFilePaths(filePath, paths)
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
  const paths = _findDepthFilePaths(directory)
  return paths.map(p => path.relative(directory, p).replace(/\\/g, '/'))
}

export function findFuzzyDepthFilePaths(directory: string, keyword: string) {
  const files = fs.readdirSync(directory)
  let foundFiles: string[] = []
  files.forEach((file) => {
    const filePath = path.join(directory, file)
    const fileStat = fs.statSync(filePath)

    if (fileStat.isDirectory()) {
      const nestedFiles = findFuzzyDepthFilePaths(filePath, keyword)
      foundFiles = foundFiles.concat(nestedFiles)
    }
    else {
      if (file.includes(keyword))
        foundFiles.push(filePath)
    }
  })
  return foundFiles
}
