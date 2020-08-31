'use strict'
import { Kafka } from 'kafkajs'
import config from '../config'

const publishTopic = config.kafkaTopics.publishTopic

const kafka = new Kafka({
  clientId: 'kafka-node-app',
  brokers: [`${config.kafka.brokerHost}:${config.kafka.brokerPort}`]
})

const producer = kafka.producer()

export default {
  /**
   * Send the event message
   * @param {string} eventType
   * @param {object} params
   */
  sendEvent: async (eventType, params) => {
    const message = _generateEventMessage(eventType, params)

    await producer.connect()
    await producer.send({
      topic: publishTopic,
      messages: [
        { value: JSON.stringify(message) }
      ]
    })
    await producer.disconnect()
  }
}

/**
 * generate event message
 * @param {string} eventType
 * @param {object} params
 * @returns {string} event json message
 */
function _generateEventMessage(eventType, params) {
  const message = {
    meta: {
      type: 'event'
    },
    eventType: eventType,
    data: {
      jobId: params.jobId
    }
  }

  if (eventType === 'Render.Start') {
    message.data.engineName = params.engineName
  } else if (eventType === 'Render.Finish') {
    message.data.result = 'success'
    message.data.resultMainFile = params.resultMainFile
    message.data.resultSubFiles = params.resultSubFiles
    message.data.info = {}
  } else {
    message.data.result = 'Fail'
    message.data.errorCode = params.errorCode
    message.data.errorMessage = params.errorMessage
  }

  return message
}