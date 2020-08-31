'use strict'
import swaggerJSDoc from 'swagger-jsdoc'
import config from '../config/'

var options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'FOP Render Engine API',
      description: 'New optimized FOP render engine',
      version: '0.0.1'
    },
    servers: [
      {
        url: `http://${config.host}:${config.port}/{basePath}`,
        variables: {
          basePath: {
            default: 'api/v1'
          }
        }
      },
      {
        url: `https://${config.host}:${config.port}/{basePath}`,
        variables: {
          basePath: {
            default: 'api/v1'
          }
        }
      }
    ]
  },
  apis: ['src/controllers/*.js']
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
