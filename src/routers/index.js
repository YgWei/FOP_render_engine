'use strict'
import { Router } from 'express'
import ApiRouter from './api'

const router = Router()

router.use('/api/v1', ApiRouter)

export default router
