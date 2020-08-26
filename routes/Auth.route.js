const {Router} = require('express')
const createError = require('http-errors')
const User = require('../Models/User.model')
const router = Router()
const authSchema = require('../helpers/validation')
const {
  signAccessToken,
  signRefreshAccessToken,
  verifyRefreshToken
} = require('../helpers/jwt')
const client = require('../helpers/redis')

router.post('/register', async (req, res, next) => {
  try {
    //const {email, password} = req.body
    //if (!email || !password) throw createError.BadRequest()
    const result = await authSchema.validateAsync(req.body)

    const doesUserExist = await User.findOne({email: result.email})
    if (doesUserExist) 
      throw createError.Conflict(`${result.email} is already been registered`)

    const user = new User(result)
    const savedUser = await user.save()
    const token = await signAccessToken(savedUser.id)
    const refresh_token = await signRefreshAccessToken(savedUser.id)
    res.send({token, refresh_token})
  } catch(error) {
    next(error)
  }
})
router.post('/login', async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body)
    const doesUserExist = await User.findOne({email: result.email})
    if (!doesUserExist)
      throw createError.NotFound('User not registered')

    const matchPassword = await doesUserExist.verifyPassword(result.password)
    if (!matchPassword)
      throw createError.Unauthorized('Username/Password not valid')

    const token = await signAccessToken(doesUserExist.id)
    const refresh_token = await signRefreshAccessToken(doesUserExist.id)
    res.send({token, refresh_token})
  } catch (error) {
    if (error.isJoi === true)
      return next(createError.BadRequest('Invalid Username/Password'))
    next(error)
  }
})
router.post('/refresh-token', async (req, res, next) => {
  try {
    const {refresh_token} = req.body
    if (!refresh_token)
      throw createError.BadRequest()

    const userId = await verifyRefreshToken(refresh_token)
    const token = await signAccessToken(userId)
    const refreshToken = await signRefreshAccessToken(userId)
    res.send({token, refresh_token:refreshToken})
  } catch (error) {
    next(error)
  }
})
router.delete('/logout', async (req, res, next) => {
  try {
    const {refresh_token} = req.body
    if (!refresh_token) throw createError.BadRequest()
    const userId = await verifyRefreshToken(refresh_token)
    client.DEL(userId, (err, value) => {
      if (err) {
        console.log(err.message)
        throw createError.InternalServerError()
      }
      console.log(value)
      res.sendStatus(204)
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
