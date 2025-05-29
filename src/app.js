/* eslint global-require: "off", no-console: "off" */
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import rewrite from 'express-urlrewrite'

import { logger } from './util/logger'
import { baseUrl, isDev } from './util'

import prettyPrintJson from './middleware/prettyPrintJson'
import authDev from './auth/dev'
import authShibboleth from './auth/shibboleth'
import authLogout from './auth/logout'
import authnToken from './middleware/authnToken'
import authnJwt from './middleware/authnJwt'
import checkAuthn from './middleware/checkAuthn'
import authz from './middleware/authz'
import redirectIfNeedsAuthn from './middleware/redirectIfNeedsAuthn'
import users from './api/users'
import tokens from './api/tokens'
import courses from './api/courses'
import queues from './api/queues'
import questions from './api/questions'
import autocomplete from './api/autocomplete'
import courseShortcodes from './middleware/courseShortcodes'
import redirectNoQueue from './middleware/redirectNoQueue'
import handleError from './middleware/handleError'

const app = express()

// We're probably running behind a proxy - trust them and derive information
// from the X-Forwarded-* headers: https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 'loopback')

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Forward next + statics requests to the right route handlers
app.use(rewrite(`${baseUrl}/_next/*`, '/_next/$1'))
app.use(rewrite(`${baseUrl}/static/*`, '/static/$1'))

// Prettify all json by default
app.use(prettyPrintJson)

// Authentication
// All auth is handled by the /login route. In production, /login/shib is
// a special Shib-protected route. When a user is directed to that page,
// they'll need to sign in to Shib if they aren't already. Then, the request
// will hit that page with their user information present in headers. We can
// then establish our own session with them, which can persist beyond Shib's
// authentication restrictions.
if (isDev) {
  app.use(`${baseUrl}/login/dev`, authDev.default)
}
app.use(`${baseUrl}/login/shib`, authShibboleth.default)
app.use(`${baseUrl}/logout`, authLogout.default)

app.use(`${baseUrl}/api`, authnToken.default)
app.use(`${baseUrl}/api`, authnJwt.default)
app.use(`${baseUrl}/api`, checkAuthn.default)
app.use(`${baseUrl}/api`, authz.default)

// This will selectively send redirects if the user needs to (re)authenticate
// Useful mostly on initial page load - avoids having to detect that we
// aren't authed on the client and redirect there.
app.use(`${baseUrl}/`, redirectIfNeedsAuthn.default)

// API routes
app.use(`${baseUrl}/api/users`, users)
app.use(`${baseUrl}/api/tokens`, tokens)
app.use(`${baseUrl}/api/courses`, courses)
app.use(`${baseUrl}/api/queues`, queues)
app.use(`${baseUrl}/api/questions`, questions)
app.use(`${baseUrl}/api/courses/:courseId/queues`, queues)
app.use(`${baseUrl}/api/courses/:courseId/queues/:queueId/questions`, questions)
app.use(`${baseUrl}/api/queues/:queueId/questions`, questions)
app.use(`${baseUrl}/api/autocomplete`, autocomplete)

// Use special not-found/error middleware for the API
app.use(`${baseUrl}/api`, (err, _req, res, _next) => {
  const statusCode = err.httpStatusCode || 500
  const message = err.message || 'Something went wrong'
  res.status(statusCode).json({ message })
  if (process.env.NODE_ENV !== 'test') {
    logger.error(err)
  }
})
app.use(`${baseUrl}/api`, (_req, res, _next) => {
  res.status(404).json({
    message: 'Not Found',
  })
})

// Support for course shortcodes
app.use(`${baseUrl}/:courseCode`, courseShortcodes.default)

// Support for redirects of nonexistent queues
app.use(`${baseUrl}/queue/:queueId`, redirectNoQueue.default)

// Error handling! This middleware should always be the last one in the chain.
app.use(handleError.default)

export default app
