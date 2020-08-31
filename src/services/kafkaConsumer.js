'use strict'
import { Kafka } from 'kafkajs'
import config from '../config'
import logger from '../logger/system'
import kafkaProducer from './kafkaProducer'
import commandHandler from '../handler/command'

const subscribeTopic = config.kafkaTopics.subscribeTopic
const groupId = config.kafka.groupId

const kafka = new Kafka({
  clientId: 'kafka-node-app',
  brokers: [`${config.kafka.brokerHost}:${config.kafka.brokerPort}`]
})

// sessionTimeout is needed for kafka broker to know how long the message gonna be processed before it uncommit the message.
const consumer = kafka.consumer({ groupId: groupId, sessionTimeout: 200000 })

export default {
  startListener: async () => {
    await consumer.connect()
    await consumer.subscribe({ topic: subscribeTopic, fromBeginning: true })
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        logger.debug(`Get message ${message.value} from ${topic}`)
        let parsedMessage
        try {
          parsedMessage = JSON.parse(message.value)
        } catch (err) {
          // If can't parsed message, print error and exit function
          logger.error(`Can't parsed message to json. Message: ${message.value}`)
          return
        }
        try {
          await commandHandler.handler(parsedMessage)
        } catch (err) {
          // process unexpected exception
          logger.error(`Unexpected fail: ${err.message}. Stack: ${err.stack}`)

          const eventFailMessage = {
            jobId: parsedMessage.payload.jobId,
            errorCode: err.code,
            errorMessage: err.message
          }
          await kafkaProducer.sendMessage('Render.Fail', eventFailMessage)
        }
      }
    })
  },
  stopListener: async () => {
    await consumer.disconnect()
    logger.info('Consumer stopped.')
  }
}
