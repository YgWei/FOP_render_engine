'use strict'
import folderInspector from './folder'
import kafkaInspector from './kafka'

export default {
  beforeStartup: async () => {
    folderInspector.checkExist()
    await kafkaInspector.checkTopic()
  }
}