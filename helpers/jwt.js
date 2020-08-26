const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const client = require('./redis')

const signAccessToken = (userId) => {
  return new Promise((ok, bad) => {
    const payload = {}
    const secret = process.env.TOKEN_SECRET
    const options = {
      expiresIn: "15s", // Expires in 15 sec
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
      const message = 
        err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
      return next(createError.Unauthorized(message))
    }
    req.payload = payload
    next()
  })
}

const signRefreshAccessToken = (userId) => {
  return new Promise((ok, bad) => {
    const payload = {}
    const secret = process.env.REFRESH_TOKEN_SECRET
    const options = {
      expiresIn: "1y", // Expires in 1 year
      issuer: process.env.DOMAIN,
      audience: userId
    }
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        //return bad(err)
        return bad(createError.InternalServerError())
      }
      const exp =  365 * 24 * 60 * 60 // seconds: expires on 1 year
      client.SET(userId, token, 'EX', exp, (err, reply) => {
        if (err) {
          console.log(err.message)
          return bad(createError.InternalServerError())
        }
        console.log(reply)
        ok(token)
      })
    })
  })
}

const verifyRefreshToken = (refreshToken) => {
  return new Promise((ok, bad) => {
    JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) {
          const message = 
            err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
          return bad(createError.Unauthorized(message))
        }
        console.log(payload)
        const userId = payload.aud
        client.GET(userId, (err, result) =>{
          if (err) {
            console.log(err.message)
            return bad(createError.InternalServerError())
          }
          if (refreshToken === result) {
            return ok(userId)
          }
          bad(createError.Unauthorized())
        })
    })
  })
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshAccessToken,
  verifyRefreshToken
}
