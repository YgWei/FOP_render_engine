import config from '../config'

const engineName = config.engine.name
const version = config.engine.version
const attributes = {
  inputFormats: config.engine.supportInFormats.split(','),
  outputFormats: config.engine.supportOutFormats.split(',')
}

class Status {
  constructor(engineName = '', version, attributes = {}) {
    this.engineName = engineName
    this.engineId = ''
    this.version = version
    this.attributes = {
      inputFormats: attributes.inputFormats || [],
      outputFormats: attributes.outputFormats || [],
      filter: attributes.filter || {}
    }
    this.isWorking = false
    this.lastJobId = ''
  }

  setEngineId(engineId) {
    this.engineId = engineId
  }

  getEngineId() {
    return this.engineId
  }

  getEngineName() {
    return this.engineName
  }

  getJobId() {
    return this.lastJobId
  }

  setRenderJobStatus(jobId, isWorking) {
    this.lastJobId = jobId
    this.isWorking = isWorking
  }
}

export default new Status(engineName, version, attributes)
