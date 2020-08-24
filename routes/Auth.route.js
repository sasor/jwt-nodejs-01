const {Router} = require('express')
const createError = require('http-errors')
const User = require('../Models/User.model')
const router = Router()

router.post('/register', async (req, res, next) => {
  try {
    const {email, password} = req.body
    if (!email || !password) throw createError.BadRequest()

    const doesUserExist = await User.findOne({email: email})
    if (doesUserExist) throw createError.Conflict(`${email} is already been registered`)

    const user = new User({email, password})
    const savedUser = await user.save()
    res.send(savedUser)
  } catch(error) {
    next(error)
  }
})
router.post('/login', async (req, res, next) => {
  res.send('login')
})
router.post('/refresh-token', async (req, res, next) => {
  res.send('refresh token')
})
router.delete('/logout', async (req, res, next) => {
  res.send('logout')
})

module.exports = router
