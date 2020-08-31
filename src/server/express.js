'use strict'
import express from 'express'
import cors from 'cors'
import routers from '../routers'
import bodyParser from 'body-parser'
import requestID from '../middlewares/requestID'
import httpLogger from '../middlewares/logger'
import * as errorHandler from '../middlewares/errorHandler'
import config from '../config'
import fs from 'fs'
import logger from '../logger/system'

export default {
  start: async () => {
    const app = express()
    app.use(bodyParser.json())
    app.use(errorHandler.bodyParser)

    app.use(httpLogger.requestLogger)

    app.use(requestID())
    app.use(cors())

    // Swagger UI
    const pathToSwaggerUi = require('swagger-ui-dist').absolutePath()
    const swaggerIndexContent = fs
      .readFileSync(`${pathToSwaggerUi}/index.html`)
      .toString()
      .replace('https://petstore.swagger.io/v2/swagger.json', '/api/v1/swagger.json')

    app.get('/api-docs/index.html', (req, res) => res.send(swaggerIndexContent))
    app.get('/api-docs', (req, res) => res.redirect('/api-docs/index.html'))
    app.use('/api-docs', express.static(pathToSwaggerUi))

    // API routes
    app.use(routers)

    app.use(errorHandler.methodNotAllowed)
    app.use(httpLogger.responseLogger)

    app.use(function (error, req, res, next) {
      logger.error(`Unhandled error: ${error.message}`)
    })

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`)
    })
  }
}
