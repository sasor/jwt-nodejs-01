const {Router} = require('express')
const createError = require('http-errors')
const User = require('../Models/User.model')
const router = Router()
const authSchema = require('../helpers/validation')
const {signAccessToken} = require('../helpers/jwt')

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
    res.send({token})
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
    res.send({token})
  } catch (error) {
    if (error.isJoi === true)
      return next(createError.BadRequest('Invalid Username/Password'))
    next(error)
  }
})
router.post('/refresh-token', async (req, res, next) => {
  res.send('refresh token')
})
router.delete('/logout', async (req, res, next) => {
  res.send('logout')
})

module.exports = router
