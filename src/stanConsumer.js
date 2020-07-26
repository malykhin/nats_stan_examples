const stan = require('node-nats-streaming')
const { connect } = require('nats')
const nKeys = require('ts-nkeys')
const { v1: uuid } = require('uuid')

const { N_KEY_SEED, N_KEY, NATS_URL, SUBJECT } = require('./config')

const clusterID = 'test-cluster'
const clientID = `node-stan-consume-${uuid()}`

const NAME = 'workers'
const DURABLE_NAME = `worker`
const MAX_WAIT = 1000

const nc = connect(NATS_URL, {
  nkey: N_KEY,
  encoding: 'binary',
  nonceSigner: (nonce) => nKeys.fromSeed(Buffer.from(N_KEY_SEED)).sign(nonce),
})

const sc = stan.connect(clusterID, clientID, { nc, encoding: 'binary' })

sc.on('connect', () => {
  const opts = sc
    .subscriptionOptions()
    .setDeliverAllAvailable()
    .setDurableName(DURABLE_NAME)
    .setManualAckMode(true)
    .setAckWait(MAX_WAIT)

  const subscription = sc.subscribe(SUBJECT, NAME, opts)

  subscription.on('error', (error) => {
    console.log(`subscription for ${SUBJECT} raised an error: ${error}`)
  })

  subscription.on('unsubscribed', () => {
    console.log(`unsubscribed to ${SUBJECT}`)
  })

  subscription.on('message', (message) => {
    console.log(`received a message [${message.getSequence()}] ${message.getData()}`)
    message.ack()
  })
})

sc.on('close', () => {
  process.exit()
})

nc.on('error', (error) => {
  console.log(`nats error: ${error}`)
})
