'use strict'
import { Router } from 'express'
import engine from '../controllers/engine'
import swaggerSpec from '../utils/swagger'

const router = Router()

/**
 * Expose swagger.json at /api/swagger.json
 */
router.get('/swagger.json', function (req, res) {
  res.json(swaggerSpec)
})

router.use('/', engine)

export default router
