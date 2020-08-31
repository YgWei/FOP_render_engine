'use strict'
import Joi from '@hapi/joi'
import status from '../entity/status'

const supportInputFormat = status.attributes.inputFormats
const supportOutputFormat = status.attributes.outputFormats

export default {
  /**
   * Validate command message schema.
   * @param {object} message command message object
   */
  validateCommandSchema: async (message) => {
    const schema = Joi
      .object({
        meta: Joi
          .object({
            type: Joi.string().valid('cmd').required()
          })
          .required()
          .unknown(),
        payload: Joi
          .object({
            engineName: Joi.string().valid(status.engineId).required(),
            jobId: Joi.string().required().min(1)
          })
          .required()
          .unknown()
      })
      .required()
      .unknown()

    const result = await schema.validateAsync(message)
    return result
  },
  /**
   * Validate command message's command is acceptable.
   * @param {object} message command message object
   */
  validateCommand: async (message) => {
    const schema = Joi
      .object({
        payload: Joi
          .object({
            command: Joi.string().valid('RenderStart').required()
          })
          .required()
          .unknown()
      })
      .required()
      .unknown()

    const result = await schema.validateAsync(message)
    return result
  },
  /**
   * Validate payload schema.
   * @param {object} payload
   */
  validatePayload: async (payload) => {
    const schema = Joi
      .object({
        command: Joi.string().valid('RenderStart').required(),
        params: Joi
          .object({
            inFormat: Joi.string().valid(...supportInputFormat).required(),
            outFormat: Joi.string().valid(...supportOutputFormat).required(),
            xml: Joi.string().required(),
            entry: Joi.string().required()
          })
          .required()
          .unknown()
      })
      .required()
      .unknown()

    const result = await schema.validateAsync(payload)
    return result
  }
}
