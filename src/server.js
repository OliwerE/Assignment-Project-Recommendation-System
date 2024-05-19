/**
 * Module represents Express server.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import helmet from 'helmet'
import logger from 'morgan'
import cors from 'cors'
import { router } from './routes/router.js'

/**
 * Express server configuration.
 */
async function run () {
  const app = express()

  app.use(helmet())
  app.set('trust proxy', 1)
  app.use(cors({ origin: process.env.ORIGIN }))
  app.use(logger('dev'))
  app.use(express.json())

  app.use((req, res, next) => {
    res.set('Cache-control', 'no-cache')
    next()
  })

  app.use('/', router)

  app.use((err, req, res, next) => {
    if (err.status === 404) {
      return res.json({ msg: 'Not Found', status: 404 })
    }

    if (err.status === 500) {
      return res.json({ msg: 'Internal Server Error', status: 500 })
    }
  })

  app.listen(process.env.PORT, () => {
    console.log(`Listens for localhost@${process.env.PORT}`)
    console.log('ctrl + c to terminate')
  })
}
run()
