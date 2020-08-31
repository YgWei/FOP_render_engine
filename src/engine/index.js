import config from '../config'
import logger from '../logger/system'
import kafkaProducer from '../services/kafkaProducer'
import CloudService from '../services/cloudService'
import AdmZip from 'adm-zip'
import Render from '../services/render'
import path from 'path'
import fs from 'fs-extra'

const outputFolder = config.folder.outputFolder

export default {
  startRender: async (renderParam) => {
    const cloudService = new CloudService()
    const render = new Render()

    let zipPathParse
    let unZipFolderPath
    try {
      const file2download = [renderParam.xml]
      await cloudService.fileIsExist(file2download)

      logger.info('Start downloading file from cloud')
      const downloadFiles = await cloudService.download(file2download)

      zipPathParse = path.parse(downloadFiles[0].filePath)
      unZipFolderPath = `${zipPathParse.dir}/${zipPathParse.name}`

      // -- 解壓縮 --
      logger.info('Start unzipping file')
      const zip = new AdmZip(`${zipPathParse.dir}/${zipPathParse.base}`)
      zip.extractAllTo(`${unZipFolderPath}`, true) // true for overwrite
    } catch (err) {
      const error = new Error(`Download fail: ${err.message}`)
      error.code = 'DownloadError'
      throw error
    } finally {
      try {
        fs.unlinkSync(`${zipPathParse.dir}/${zipPathParse.base}`) // remove zip
      } catch (err) {
        logger.warn(err.message)
      }
    }

    let renderedFilenames
    try {
      const { xml } = render.scanFolder(unZipFolderPath)
      render.moveFileToTiff(unZipFolderPath)
      renderedFilenames = await render.renderPDF(unZipFolderPath, xml, renderParam.entry)
    } catch (err) {
      const error = new Error(`Render fail: ${err.message}`)
      error.code = 'RenderError'
      throw error
    } finally {
      try {
        render.clearFolder(unZipFolderPath)
      } catch (err) {
        logger.warn(err.message)
      }
    }

    logger.info('start upload files into cloud')
    const uploadFile = []
    for (const fileName of renderedFilenames) {
      uploadFile.push(`${outputFolder}/${fileName}`)
    }

    let uploadedFilesId
    try {
      uploadedFilesId = await cloudService.upload(uploadFile)
    } catch (err) {
      const error = new Error(`Upload Fail: ${err.message}`)
      error.code = 'UploadError'
      throw error
    } finally {
      for (const fileName of renderedFilenames) {
        try {
          fs.unlinkSync(`${outputFolder}/${fileName}`)
        } catch {
          logger.warn(`Fail to remove ${outputFolder}/${fileName}`)
        }
      }
    }

    const result = {
      resultMainFile: uploadedFilesId[0],
      resultSubFiles: uploadedFilesId[1]
    }

    return result
  }
}
