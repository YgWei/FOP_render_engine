'use strict'
import { v4 as uuidV4 } from 'uuid'

/**
 * Return middleware that gets an unique request id from a header or
 * generates a new id.
 *
 * @param {Object} [options={}] - Optional configuration.
 * @param {string} [options.header=X-Request-Id] - Request and response header name.
 * @param {string} [options.propertyName=reqId] - Context property name.
 * @param {function} [options.generator] - Id generator function.
 * @return {function} Koa middleware.
 */
export default (options = {}) => {
  const {
    header = 'X-Request-Id',
    propertyName = 'reqId',
    generator = uuidV4
  } = options

  return (req, res, next) => {
    const reqId = req.get(header) || generator()
    req[propertyName] = reqId
    res.set(header, reqId)
    next()
  }
}
