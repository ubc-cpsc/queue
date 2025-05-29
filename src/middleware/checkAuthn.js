import safeAsync from './safeAsync'

/**
 * Checks to see if a previous middleware authenticated. If that happened,
 * then `res.locals.userAuthn` will be set.
 */
export default safeAsync(async (req, res, next) => {
  if (!res.locals.userAuthn) {
    res.status(401).send()
    return
  }

  next()
})
