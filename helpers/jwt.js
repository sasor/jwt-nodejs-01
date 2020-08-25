const JWT = require('jsonwebtoken')
const createError = require('http-errors')

const signAccessToken = (userId) => {
  return new Promise((ok, bad) => {
    const payload = {}
    const secret = process.env.TOKEN_SECRET
    const options = {
      expiresIn: "1h",
      issuer: process.env.DOMAIN,
      audience: userId
    }
    JWT.sign(payload, secret, options, (err, token) => {
      if (err)
        //return bad(err)
        return bad(createError.InternalServerError())
      ok(token)
    })
  })
}

const verifyAccessToken = (req, res, next) => {
  const headerAuthorization = req.headers['authorization']
  if (!headerAuthorization)
    return next(createError.Unauthorized())

  const bearer = headerAuthorization.split(' ')
  const token = bearer[1]
  JWT.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err) {
      return next(createError.Unauthorized())
    }
    req.payload = payload
    next()
  })
}

module.exports = {
  signAccessToken,
  verifyAccessToken
}
