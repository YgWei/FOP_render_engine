'use strict'
import fs from 'fs-extra'
import config from '../config'

export default {
  checkExist: () => {
    for (const key in config.folder) {
      const folder = config.folder[key]

      switch (folder) {
        case 'storage':
          if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder)
          }
          break
        case 'template':
          if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder)
          }
          break
        default:
          fs.emptyDirSync(folder)
          break
      }
    }
  }
}
