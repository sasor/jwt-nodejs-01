const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
const {connect, connection} = require('mongoose')
require('dotenv').config()

const AuthRoute = require('./routes/Auth.route')

const app = express()
app.set('port', process.env.PORT || 3000)
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('dev'))

app.get('/', async (req, res) => {
  res.send({success: true})
})

app.use('/auth', AuthRoute)

app.use(async (req, res, next) => {
  //const error = new Error("Not Found")
  //error.status = 404
  //next(error)
  next(createError.NotFound())
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    success: false,
    error: {
      status: err.status || 500,
      message: err.message
    }
  })
})

connect(process.env.MONGO_URI, {
  dbName: process.env.MONGO_DB,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
  .then(
    app.listen(
      app.get('port'),
      _ => console.log(`live at: http://localhost:${app.get('port')}`)
    )
  )
  .catch(err => console.log(err.message))

connection.on('connected', _ => console.log('Mongoose connected to db'))
connection.on('error', (err) => console.log(err.message))
connection.on(
  'disconnected',
  _ => console.log('Mongoose connection is disconnected')
)
process.on('SIGINT', async _ => {
  await connection.close()
  process.exit(0)
})
