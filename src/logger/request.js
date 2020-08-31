'use strict'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import config from '../config'

const directory = config.logger.directory
const fileName = `request.${config.logger.fileName}`
const logLevel = config.logger.level

const format = winston.format
const logger = winston.createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new (DailyRotateFile)({
      filename: `${fileName}.%DATE%.log`,
      dirname: directory,
      datePattern: 'YYYY-MM-DD'
    })
  ]
})

export default logger
