'use strict'
import dotenv from 'dotenv'
import ip from 'ip'
import path from 'path'

dotenv.config()

const env = process.env.NODE_ENV || 'development'

const csUrlApi = `${process.env.CS_PROTOCOL}://${process.env.CS_HOST}:${process.env.CS_PORT}/api/${process.env.CS_COLLECTION}`

const configs = {
  base: {
    host: process.env.APP_HOST || 'localhost',
    port: process.env.APP_PORT || 8080,
    root: path.resolve(__dirname, '../..'),
    logger: {
      fileName: process.env.LOG_FILENAME || 'RenderEngine',
      directory: process.env.LOG_DIRECTORY || 'logs',
      level: process.env.LOG_LEVEL || 'info'
    },
    kafka: {
      clientId: process.env.CLIENT_ID || 'kafka-node-app',
      brokerHost: process.env.BROKER_HOST || '192.168.20.62',
      brokerPort: process.env.BROKER_PORT || '31090',
      groupId: process.env.GROUP_ID || 'werry'
    },
    kafkaTopics: {
      subscribeTopic: process.env.SUBSCRIBE_TOPIC || 'kafka-testing',
      publishTopic: process.env.PUBLISH_TOPIC || 'kafka-publish-testing'
    },
    dispatch: {
      protocol: process.env.DISPATCH_PROTOCOL || 'http',
      host: process.env.DISPATCH_HOST || '',
      port: process.env.DISPATCH_PORT || '',
      registerPath: process.env.REGISTER_PATH,
      unregisterPath: process.env.UNREGISTER_PATH
    },
    engine: {
      name: process.env.HOSTNAME || 'testName',
      version: process.env.ENGINE_VERSION || 'v1',
      supportInFormats: process.env.ENGINE_SUPPORT_INPUT || 'html',
      supportOutFormats: process.env.ENGINE_SUPPORT_OUTPUT || 'pdf',
      address: ip.address() || ''
    },
    cloudStorage: {
      protocol: process.env.CS_PROTOCOL || 'http',
      host: process.env.CS_HOST || 'localhost',
      port: process.env.CS_PORT || 5000,
      collection: process.env.CS_COLLECTION || 'werrykafka',
      timeout: process.env.TIMEOUT || 5000,
      retryTimes: process.env.RETRY_TIMES || 2,
      retryDelay: process.env.RETRY_DELAY || 1000
    },
    cloudStorageApi: {
      expireTime: process.env.UPLOAD_EXPIRE_TIME || 720,
      expireUrl: `${csUrlApi}/fileExpire`,
      upload: `${csUrlApi}/upload`,
      download: `${csUrlApi}/download`,
      checkExist: `${csUrlApi}/files/exist`,
      getMd5: `${csUrlApi}/md5`
    },
    folder: {
      downloadFolder: process.env.DOWNLOAD_FOLDER || 'download',
      outputFolder: process.env.OUTPUT_FOLDER || 'output',
      storageFolder: process.env.STORAGE_FOLDER || 'storage',
      templateFolder: process.env.TEMPLATE_FOLDER || 'template'
    }
  },
  production: {
  },
  development: {
  },
  test: {
  }
}
const config = Object.assign(configs.base, configs[env])

export default config
