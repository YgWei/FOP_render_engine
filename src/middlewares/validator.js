'use strict'
export default (schemas, options) => {
  options = {
    ...options,
    abortEarly: false,
    allowUnknown: true
  }

  return async (req, res, next) => {
    if (!schemas) {
      await next()
      return
    }
    for (const key in schemas) {
      if (key === 'params') {
        const { error } = await schemas[key].validate(req.params)
        if (error) {
          throw error
        }
      } else {
        const { error } = await schemas[key].validate(req[key])
        if (error) {
          const { details } = error
          const message = details.map((i) => i.message).join(',')
          res.status(422).json({ error: message })
        } else {
          next()
        }
      }
    }
  }
}
