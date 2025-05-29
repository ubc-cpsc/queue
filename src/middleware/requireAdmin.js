import { ApiError } from '../api/util'

export default (req, res, next) => {
  if (!res.locals.userAuthz.isAdmin) {
    next(new ApiError(403, "You don't have authorization to do that"))
    return
  }
  next()
}
