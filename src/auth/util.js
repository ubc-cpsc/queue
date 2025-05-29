import { sign, verify } from 'jsonwebtoken'
import { URL } from 'url'

import { Course } from '../models'
import { User } from '../models'
import { isDev } from '../util'

if (!isDev && !process.env.JWT_SECRET) {
  throw new Error(
    'You must set the JWT_SECRET environment variable in production!'
  )
}
const JWT_SECRET = process.env.JWT_SECRET || 'useastrongkeyinproduction!!!'

/**
 * Create + update user in the DB
 * Their displayed name might have changed since their last Shib login,
 * so we'll take this opportunity to update it in the DB if needed.
 */
export async function createOrUpdateUser(req, uid) {
  const [user] = await User.findOrCreate({ where: { uid } })
  const name = req.get('displayname')
  if (name && name !== user.universityName) {
    user.universityName = name
    await user.save()
  }
  return user
}

export function addJwtCookie(req, res, user) {
  // We'll now create a token for this user. This will be set as a cookie
  // and sent back to us with any future requests.
  const tokenData = {
    sub: user.uid,
  }
  const tokenOptions = {
    expiresIn: '28 days',
  }
  const token = sign(tokenData, JWT_SECRET, tokenOptions)

  res.cookie('jwt', token, {
    maxAge: 1000 * 60 * 60 * 24 * 28, // 28 days
    httpOnly: true,
    // On localhost, this needs to be false for the cookie to be accepted by
    // the client
    secure: req.secure,
  })
}

export async function getUserFromJwt(token) {
  if (!token) {
    return null
  }
  try {
    const jwtData = verify(token, JWT_SECRET)
    const uid = jwtData.sub
    const user = await User.findOne({ where: { uid } })
    return user
  } catch (e) {
    // This is probably a bit overzealous, and will log for cases like a token
    // expiring.
    // TODO remove once https://github.com/illinois/queue/issues/241 is fixed
    console.error(e)
    return null
  }
}

export function isSafeUrl(req, redirect) {
  const originUrl = new URL(`${req.protocol}://${req.get('host')}`)
  const redirectUrl = new URL(redirect, originUrl)
  return redirectUrl.host === originUrl.host
}

export async function getAuthzForUser(user) {
  const staffedCourses = await Course.findAll({
    where: {
      '$staff.id$': user.id,
    },
    attributes: ['id'],
    include: [
      {
        model: User,
        as: 'staff',
        attributes: [],
      },
    ],
    raw: true,
  })
  const staffedCourseIds = staffedCourses.map(row => row.id)

  return {
    isAdmin: user.isAdmin,
    staffedCourseIds,
  }
}
