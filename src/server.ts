/* eslint global-require: "off", no-console: "off" */
import { Server } from 'http'
import io from 'socket.io'
import next from 'next'
import co from 'co'

import app from './app'
import { logger } from './util/logger'
import * as models from './models'
import * as migrations from './migrations/util'
import serverSocket from './socket/server'
import { baseUrl } from './util'

require('dotenv-flow').config({
  // eslint-disable-next-line @typescript-eslint/camelcase
  default_node_env: 'development',
})

const prodEnvironments = ['staging', 'production']
const DEV = prodEnvironments.indexOf(process.env.NODE_ENV as string) === -1
const PORT = process.env.PORT || 3000

const nextApp = next({ dev: DEV, dir: DEV ? 'src' : 'build', quiet: true })
const handler = nextApp.getRequestHandler()

/* eslint-disable func-names */
co(function*() {
  // Do this first to catch any problems during startup
  process.on('unhandledRejection', (err, promise) => {
    console.error(
      'Unhandled rejection (promise: ',
      promise,
      ', reason: ',
      err,
      ').'
    )
  })

  // Initialize the Next.js app
  yield nextApp.prepare()

  // Initialize the database
  yield migrations.performMigrations((models as any).sequelize)

  // Initialize the server
  const server = new Server(app)

  // Websocket stuff
  const socket = io(server, { path: `${baseUrl}/socket.io` })
  serverSocket(socket)

  app.all('*', (req, res) => {
    return handler(req, res)
  })

  server.listen(PORT)
  logger.info(`Listening on ${PORT}`)
}).catch(error => console.error(error.stack))
