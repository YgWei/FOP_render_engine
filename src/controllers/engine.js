'use strict'
import status from '../entity/status'
import { Router } from 'express'

const router = Router()

/**
 * @swagger
 * /status:
 *    get:
 *      summary: render engine Status
 *      description: Checking engine status
 *      tags:
 *        - Engine
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Success checking render engine status.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: engineContainer
 *                  engineId:
 *                    type: string
 *                    example: 12AB
 *                  isWorking:
 *                    type: boolean
 *                    example: true
 *                  lastJobId:
 *                    type: string
 *                    example: 21CD
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    name: status.getEngineName(),
    engineId: status.getEngineId(),
    isWorking: status.isWorking,
    lastJobId: status.getJobId()
  })
})

/**
 * @swagger
 * /health:
 *    get:
 *      summary: health data
 *      description: get health data
 *      tags:
 *        - Engine
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Success getting health data.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  message:
 *                    type: string
 *                    example: get health data success
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'get health data success'
  })
})

export default router
