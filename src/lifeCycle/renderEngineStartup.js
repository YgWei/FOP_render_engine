'use strict'
import Startup from './startup'
import server from '../server/express'
import logger from '../logger/system'
import engineService from '../services/engineService'
import inspector from '../inspector'
import kafkaConsumer from '../services/kafkaConsumer'

class RenderStartup extends Startup {
  async startupCheck() {
    await inspector.beforeStartup()
  }

  async initService() {
    await engineService.registerEngine() // registering an engine
    await kafkaConsumer.startListener()
  }

  async registerShutdownEvent() {
    process.on('beforeExit', async () => {
      try {
        await engineService.unregisterEngine()
      } catch (err) {
        logger.error(err.message)
      }
      process.exit(0)
    })
  }

  async startService() {
    // listen express
    server.start()
  }

  async startup() {
    try {
      logger.info('Startup checking...')
      await this.startupCheck()
      logger.info('Initing...')
      await this.initService()
      logger.info('Register shutdown event.')
      await this.registerShutdownEvent()
      logger.info('Starting service...')
      await this.startService()
      logger.info('Service Start.')
    } catch (err) {
      logger.error(err.message)
    }
  }
}

export default new RenderStartup()
