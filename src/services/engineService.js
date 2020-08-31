'use strict'
import config from '../config'
import logger from '../logger/system'
import status from '../entity/status'
import fs from 'fs-extra'
import axios from 'axios'

const dispatchPlatformUrl = `${config.dispatch.protocol}://${config.dispatch.host}:${config.dispatch.port}`
const registerUrl = `${dispatchPlatformUrl}/${config.dispatch.registerPath}`
const unregisterUrl = `${dispatchPlatformUrl}/${config.dispatch.unregisterPath}`
const storageFolder = config.folder.storageFolder

export default {
  /**
   * Register engine to dispatch
   */
  registerEngine: async () => {
    const isEngineIdExist = await _recoveryEngineId()
    if (isEngineIdExist) {
      logger.info('Recovery the last engine id, skipping register.')
      return
    }

    logger.info('Register engine ...')

    const options = {
      method: 'post',
      url: registerUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        name: status.name,
        core: 'belstar',
        version: status.version,
        supportInFormats: status.attributes.inputFormats,
        supportOutFormats: status.attributes.outputFormats,
        filter: {},
        address: config.engine.address
      }
    }

    try {
      const result = await axios(options)
      status.setEngineId(result.data.engineId)
      logger.info('Registered engine success')
    } catch (err) {
      let errResponse = 'none'
      if (err.response && err.response.data) {
        try {
          errResponse = JSON.stringify(err.response.data)
        } catch (err) {
          errResponse = err.response.data
        }
      }
      throw new Error(`Registered engine fail: ${err.message}. Response body: ${errResponse}`)
    }

    logger.info('write engineId to a json file')
    const jsonObj = {
      engineId: status.engineId
    }
    try {
      fs.writeFileSync(`${storageFolder}/engineId.json`, JSON.stringify(jsonObj))
    } catch (err) {
      throw new Error(`Fail to save engine id into jsonFile: ${err.message}`)
    }

    return true
  },
  /**
   * Unregister to dispatch
   */
  unregisterEngine: async () => {
    logger.info('Unregister an engine ...')
    const options = {
      method: 'post',
      url: unregisterUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        engineId: status.engineId
      }
    }

    try {
      await axios(options)
      logger.info('Unregistered engine success')
    } catch (err) {
      logger.info(`Unregistered engine fail: ${err.message}`)
      throw new Error(`Unregistered engine fail: ${err.message}`)
    }

    logger.info('remove json file that contain engineId')
    try {
      fs.unlinkSync(`${storageFolder}/engineId.json`)
    } catch (err) {
      let errResponse = 'none'
      if (err.response && err.response.data) {
        try {
          errResponse = JSON.stringify(err.response.data)
        } catch (err) {
          errResponse = err.response.data
        }
      }
      throw new Error(`Unregistered engine fail: ${err.message}. Response body: ${errResponse}`)
    }

    return true
  }
}

/**
 * Recovery engine id from last record if application is shutdown by accident
 */
async function _recoveryEngineId() {
  if (fs.existsSync(`${storageFolder}/engineId.json`)) {
    const jsonFile = fs.readFileSync(`${storageFolder}/engineId.json`)
    const jsonParsed = JSON.parse(jsonFile)
    status.setEngineId(jsonParsed.engineId)
    return true
  }
  return false
}
