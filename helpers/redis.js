const redis = require('redis')

const client = redis.createClient({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST
})

client.on('connect', _ => {
  console.log('client connected to redis...')
})
client.on('ready', _ => {
  console.log('client connected to redis and ready')
})
client.on('error', (err) => {
  console.log(err.message)
})
client.on('end', _ => {
  console.log('client disconnected from redis')
})
process.on('SIGINT', _ => {
  client.quit()
})

module.exports = client
