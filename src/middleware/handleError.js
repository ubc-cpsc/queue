import { logger } from '../util/logger'

export default (err, req, res, _next) => {
  logger.error(err.stack)
  if (res.headersSent) {
    req.socket.destroy()
    return
  }
  res.status(500).send('Something went wrong')
}
