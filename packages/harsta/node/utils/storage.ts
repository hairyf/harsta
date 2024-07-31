import path from 'node:path'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { userRoot } from '../constants/root'

export const storage = createStorage({
  driver: fsDriver({ base: path.resolve(userRoot, '.harsta/storage') }),
})
