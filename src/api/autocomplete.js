import express from 'express'
import { User, Sequelize } from '../models'
import util from './util'
import requireAdmin from '../middleware/requireAdmin'
import safeAsync from '../middleware/safeAsync'

const { failIfErrors, ApiError } = util

const router = express.Router()

router.get(
  '/users',
  [requireAdmin, failIfErrors],
  safeAsync(async (req, res, next) => {
    const { q } = req.query
    if (q === null || q === undefined) {
      next(new ApiError(422, 'No query specified'))
      return
    }
    const users = await User.findAll({
      where: {
        [Sequelize.Op.or]: {
          uid: {
            [Sequelize.Op.like]: `${q}%`,
          },
        },
      },
      limit: 10,
    })
    res.send(users)
  })
)

export default router
