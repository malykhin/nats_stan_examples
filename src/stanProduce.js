const stan = require('node-nats-streaming')
const { connect } = require('nats')
const nKeys = require('ts-nkeys')

const { N_KEY_SEED, N_KEY, NATS_URL, SUBJECT } = require('./config')

const clusterID = 'test-cluster'
const clientID = 'node-stan-produce'

const nc = connect(NATS_URL, {
  nkey: N_KEY,
  encoding: 'binary',
  nonceSigner: (nonce) => nKeys.fromSeed(Buffer.from(N_KEY_SEED)).sign(nonce),
})

const sc = stan.connect(clusterID, clientID, { nc, encoding: 'binary' })

sc.on('connect', () => {
  let count = 0

  setInterval(() => {
    const message = JSON.stringify({ count })
    console.log(`produced message: ${message}`)
    count++
    sc.publish(SUBJECT, message, (error, guid) => {
      if (error) {
        console.log(`publish failed: ${error}`)
      } else {
        console.log(`published message with guid: ${guid}`)
      }
    })
  }, 1000)
})

sc.on('close', () => {
  process.exit()
})

nc.on('error', (error) => {
  console.log(`nats error: ${error}`)
})
