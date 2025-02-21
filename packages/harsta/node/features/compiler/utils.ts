import fs from 'fs-extra'
import path from 'pathe'

export async function searchHasExtFiles(dir: string, extension: string): Promise<boolean> {
  if (!fs.existsSync(dir))
    return false
  const files = await fs.readdir(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stats = await fs.stat(filePath)
    if (stats.isDirectory()) {
      const exists = await searchHasExtFiles(filePath, extension)
      if (exists) {
        return true
      }
    }
    else if (path.extname(file) === extension) {
      return true
    }
  }

  return false
}
