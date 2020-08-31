import logger from '../logger/system'
import config from '../config'
import fs from 'fs-extra'
import fop from './fop'

const templateFolder = config.folder.templateFolder

export default class Render {
  async renderPDF(folder, xml, renderEntry) {
    logger.info('Starting to transform xml into pdf')

    let renderedFile
    try {
      renderedFile = await fop.startRender(folder, xml, renderEntry)
    } catch (err) {
      logger.info('[ Render ] : Render pdf fail', err.message)
      throw new Error(err.message)
    }
    return renderedFile
  }

  scanFolder(foldername) {
    logger.info(`[ Render ] : Scan folder, ${foldername}`)
    const fileList = fs.readdirSync(foldername)
    const xml = fileList.filter((file) => {
      return file.split('.')[1] === 'xml'
    })
    if (xml.length === 1) {
      logger.info(`[ Render ] : get XML Files ${xml}`)
      return { xml: xml[0], files: fileList }
    } else {
      throw new Error('xml can not be more than one')
    }
  }

  moveFileToTiff(folder) {
    logger.info(`[ Render ] : Move files from ${folder} to tiff`)
    try {
      fs.copySync(folder, `${templateFolder}/xsl/xsl_yangguang/tiff`)
    } catch (err) {
      logger.error(`[ Render ] : Move files error`, err.message)
      throw new Error(`err.message`)
    }
  }

  clearFolder(xmlFolder) {
    logger.info(`[ Render ] : Clear folder, tiff and ${xmlFolder}`)
    // 清空下載
    fs.removeSync(xmlFolder) // remove unzip folder
    // 清空tiff
    fs.removeSync(`${templateFolder}/xsl/xsl_yangguang/tiff`) // remove tiff
  }
}
