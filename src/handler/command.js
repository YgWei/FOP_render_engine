'use strict'
import logger from '../logger/system'
import kafkaProducer from '../services/kafkaProducer'
import status from '../entity/status'
import commandSchema from '../schema/command'
import renderEngine from '../engine'

export default {
  handler: async (command) => {
    logger.info('Validate command schema')
    try {
      // is acceptable command
      await commandSchema.validateCommandSchema(command)
    } catch (err) {
      logger.info('Not command or not assigned to this application. Ignore message.')
      return
    }

    logger.info('Validate command')
    try {
      // whethere command is supported
      try {
        await commandSchema.validateCommand(command)
      } catch (err) {
        const error = new Error(`Invalid command: ${err.message}`)
        error.code = 'CommandUnsupported'
        throw error
      }

      logger.info('Validate command payload')
      const payload = command.payload
      try {
        await commandSchema.validatePayload(payload)
      } catch (err) {
        const error = new Error(`Invalid parameters: ${err.message}`)
        error.code = 'CommandParameterError'
        throw error
      }

      // set status
      const jobId = command.payload.jobId
      logger.info(`Update status to working. JobId: ${jobId}`)
      status.setRenderJobStatus(jobId, true)

      // Send start render event
      const startParam = {
        jobId,
        engineName: status.getEngineName()
      }
      logger.info(`Send render start event. Params: ${JSON.stringify(startParam)}`)
      await kafkaProducer.sendEvent('Render.Start', startParam)

      let renderResult
      try {
        const renderParam = {
          xml: payload.params.xml,
          entry: payload.params.entry
        }
        logger.info(`Start render. Params: ${JSON.stringify(renderParam)}`)
        renderResult = await renderEngine.startRender(renderParam)
      } catch (err) {
        const error = new Error(err.message)
        error.code = err.code
        throw error
      }

      // Send finsish event
      const finishParam = {
        jobId,
        resultMainFile: renderResult.resultMainFile,
        resultSubFiles: renderResult.resultSubFiles
      }
      logger.info(`Send render finish event. Params: ${JSON.stringify(finishParam)}`)
      await kafkaProducer.sendEvent('Render.Finish', finishParam)
    } catch (err) {
      const eventFailMessage = {
        jobId: command.payload.jobId,
        errorCode: err.code,
        errorMessage: err.message
      }
      logger.info(`Send render fail event. Params: ${JSON.stringify(eventFailMessage)}`)
      await kafkaProducer.sendEvent('Render.Fail', eventFailMessage)
    } finally {
      logger.info(`Update status to free. JobId: ${command.payload.jobId}`)
      status.setRenderJobStatus(command.payload.jobId, false)
    }
  }
}
