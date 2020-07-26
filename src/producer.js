const { connect } = require('ts-nats')
const nKeys = require('ts-nkeys')

const { N_KEY_SEED, N_KEY, NATS_URL, SUBJECT } = require('./config')

async function run() {
  try {
    const nc = await connect({
      url: NATS_URL,
      nkey: N_KEY,
      nonceSigner: (nonce) => nKeys.fromSeed(Buffer.from(N_KEY_SEED)).sign(Buffer.from(nonce)),
    })
    let count = 0
    setInterval(() => {
      const message = JSON.stringify({ count })
      console.log('produced message: ', message)
      count++
      return nc.publish(SUBJECT, message)
    }, 1000)
  } catch (error) {
    console.log(error)
  }
}

run()
