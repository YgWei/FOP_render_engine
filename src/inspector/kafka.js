'use strict'
import { Kafka } from 'kafkajs'
import config from '../config'
import logger from '../logger/system'

const kafka = new Kafka({
  clientId: 'kafka-node-app',
  brokers: [`${config.kafka.brokerHost}:${config.kafka.brokerPort}`]
})
const admin = kafka.admin()

export default {
  /**
   * Confirm topic is exist. If not exist, create topic.
   */
  checkTopic: async () => {
    try {
      await admin.connect()
    } catch (err) {
      logger.error(`Fail to connect with kafka: ${err.message}`)
      throw new Error(`Fail to connect with kafka: ${err.message}`)
    }

    for (const topic in config.kafkaTopics) {
      const topicObj = {
        topic: config.kafkaTopics[topic]
      }
      // use createTopic API and pass topic object
      const topicCreated = await admin.createTopics({
        waitForLeaders: true,
        topics: [topicObj]
      })

      if (topicCreated) {
        logger.info(`Topic: ${topicObj.topic} created`)
      } else {
        logger.info(`Topic: ${topicObj.topic} already exist`)
      }
    }
    await admin.disconnect()
  }

}
