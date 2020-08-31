'use strict'

export default class Startup {
  async startupCheck() {
    console.log('Do some check step before start initial')
  }

  async initService() {
    console.log('Init service.')
  }

  async recoveryLastStatus() {
    console.log('Recovery service\'s status')
  }

  async registerShutdownEvent() {
    process.on('beforeExit', async function () {
      console.log('Process before shutdown.')
      process.exit(0)
    })
  }

  async startService() {
    console.log('Start your service.')
  }

  async startup() {
    try {
      await this.startupCheck()
      await this.initService()
      await this.recoveryLastStatus()
      await this.registerShutdownEvent()
      await this.startService()
    } catch (err) {
      console.log(`Some error happen when start service. ${err.message}. ${err.stack}`)
    }
  }
}
