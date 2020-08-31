'use strict'
import logger from '../logger/system'
import md5 from 'md5-promised'
import config from '../config'
import _ from 'lodash'
import path from 'path'
import fs from 'fs-extra'
import request from 'request-promise'
import delay from 'delay'
import axios from 'axios'

const MAX_RETRY_TIMES = config.cloudStorage.retryTimes
const RETRY_DELAY = config.cloudStorage.retryDelay
const TIMEOUT = config.cloudStorage.timeout

const checkUrl = config.cloudStorageApi.checkExist
const downloadUrl = config.cloudStorageApi.download
const uploadUrl = config.cloudStorageApi.upload
const expireUrl = config.cloudStorageApi.expireUrl
const expireTime = config.cloudStorageApi.expireTime
const getMd5 = config.cloudStorageApi.getMd5

const downloadFolder = config.folder.downloadFolder

export default class cloudService {
  /**
   * [fileIsExist description]
   * 確定雲端儲存是否有這些檔案，外部需要攔截連線錯誤。
   * @param  {[Array]}  uuids [檔案uuid 陣列]
   * @return {true | false}       [是否全部存在]
   */
  async fileIsExist(uuids = []) {
    logger.info('Checking if files are exist...')
    const options = {
      method: 'POST',
      url: checkUrl,
      body: {
        filesID: uuids
      },
      json: true,
      timeout: TIMEOUT
    }
    try {
      const result = await request(options)
      const haveFalse = _.find(result, function (item) {
        return item.isExist === false
      })
      if (haveFalse) {
        throw new Error(`This file is not exist => ${haveFalse._id}`)
      }
      return true
    } catch (err) {
      throw new Error(`Error when checking files exist => ${err.message}`)
    }
  }
  /**
   * 上傳檔案,具有重試功能
   * @param  {Array} filesPath 上傳檔案路徑
   * @return {Promise}
   */
  async upload(filesPath = []) {
    let currentRetryTime = 1
    const service = this
    try {
      for (currentRetryTime; currentRetryTime <= MAX_RETRY_TIMES; currentRetryTime++) {
        const result = await service.uploadFiles(filesPath)
        if (result.isSuccess) {
          const filesId = result.response.map(res => {
            return res._id
          })
          await this.setFileExpireHR(filesId)
          return filesId
        } else {
          await delay(RETRY_DELAY)
          logger.info(`uploadFiles retry ${currentRetryTime} times, reason: ${result.reason}`)
          if (currentRetryTime === parseInt(MAX_RETRY_TIMES)) {
            throw new Error(result.reason)
          }
        }
      }
    } catch (err) {
      throw new Error(`Upload File To Cloud Storage Fail: ${err.message}`)
    }
  }
  /**
   * 設定雲端儲存檔案的過期日期
   * @param {Array} fileuuid [說明] 雲端儲存檔案的uuid
   * @return [說明] {result:true(200 成功回應)/false(失敗回應) , body: if true, response: if false}
   */
  async setFileExpireHR(fileuuid = []) {
    const options = {
      method: 'POST',
      url: expireUrl,
      body: {
        filesID: fileuuid,
        expireAfterHR: expireTime
      },
      json: true,
      resolveWithFullResponse: true
    }
    try {
      const response = await request(options)
      return { result: true, body: response.body }
    } catch (error) {
      logger.error(`Fail to set expire time on uploaded files: ${error.message}`)
    }
  }
  /**
  * 下載檔案以及確認 md5,具有重試功能
   * @param  {Array} filesPath 上傳檔案路徑
   * @return {Promise}
   */
  async download(filesPath = []) {
    let currentRetryTime = 1
    const service = this
    try {
      for (currentRetryTime; currentRetryTime <= MAX_RETRY_TIMES; currentRetryTime++) {
        const result = await service.downloadFiles(filesPath)
        if (result.isSuccess) {
          return result.filesPath
        } else {
          await delay(RETRY_DELAY)
          logger.info(`downloadImages retry ${currentRetryTime} times, reason => ${result.reason}`)
          if (currentRetryTime === parseInt(MAX_RETRY_TIMES)) {
            throw new Error(result.reason)
          }
        }
      }
    } catch (err) {
      throw new Error(`Download file from cloud storage fail => ${err.message}`)
    }
  }
  /**
   * [_getMd5 取得特定檔案md5編碼]
   * @param  {[String]}  uuid       [file uuid]
   * @return {Promise}            [md5 code]
   */
  async _getMd5(uuid) {
    const url = `${getMd5}/${uuid}`
    const options = {
      method: 'GET',
      url: url,
      timeout: TIMEOUT,
      json: true
    }
    try {
      const result = await request(options)
      return result.md5
    } catch (err) {
      logger.error(`error when get md5: ${err}`)
    }
  }
  /**
   * [checkMd5 確認檔案正確性]
   * @param  {[String]}  md5Code  [比對值]
   * @param  {[file path parse]}  filePath [目標檔案]
   * @return {Promise}          [description]
   */
  async _checkMd5(md5Code, filePath) {
    const targetFilePath = `${filePath.dir}/${filePath.base}`
    const fileMd5 = await md5(targetFilePath)
    return md5Code === fileMd5
  }
  /**
   * [downloadFiles 下載檔案以及確認 md5]
   * @param  {Array} filesPath 上傳檔案路徑
   * @return {Promise}
   */
  async downloadFiles(files = []) {
    const tempFile = []
    for (let fileUuid of files) {
      const options = {
        method: 'get',
        url: `${downloadUrl}/${fileUuid}`,
        resolveWithFullResponse: true,
        responseType: 'arraybuffer'
      }
      const cloudMd5 = await this._getMd5(fileUuid)
      let fileName
      try {
        const result = await axios(options)
        fileName = decodeURIComponent(result.headers['filename'])
        try {
          fs.writeFileSync(`${downloadFolder}/${fileName}`, result.data)
        } catch (err) {
          return { isSuccess: false, reason: `Download file error: ${err}` }
        }
        tempFile.push({ filePath: `${downloadFolder}/${fileName}` })
      } catch (err) {
        return { isSuccess: false, reason: `Download file error: ${err.message}` }
      }

      // -- check md5
      const filePathParse = path.parse(`${downloadFolder}/${fileName}`)
      const md5Result = await this._checkMd5(cloudMd5, filePathParse)
      if (!md5Result) {
        // --md5 爆炸拉
        return { isSuccess: false, reason: 'md5 error' }
      }
    }
    return { isSuccess: true, filesPath: tempFile }
  }
  /**
   * [uploadFiles 上傳檔案]
   * @param  {Array} filesPath 上傳檔案路徑
   * @return {Promise}
   */
  async uploadFiles(filesPath = []) {
    let files = []
    try {
      files = await Promise.all(filesPath.map(async function (pathParse) {
        return fs.createReadStream(pathParse)
      }))
    } catch (err) {
      return { result: false, reason: 'files stream fail' }
    }
    const options = {
      method: 'POST',
      uri: uploadUrl,
      formData: {
        file: files
      },
      json: true
    }

    let uploadResponse
    try {
      uploadResponse = await request(options)
    } catch (err) {
      return { result: false, reason: `upload fail: ${err.message}` }
    }
    // --- check md5 ---

    const filePathMd5 = []
    for (const filePath of filesPath) {
      const fileMd5 = await md5(filePath)
      filePathMd5.push(fileMd5)
    }
    const uploadResponseMd5 = uploadResponse.map(res => res.md5)
    const equalMd5 = _.isEqual(filePathMd5.sort(), uploadResponseMd5.sort())
    if (!equalMd5) {
      return { isSuccess: false, reason: 'md5 check fail' }
    }

    return { isSuccess: true, response: uploadResponse }
  }
}
