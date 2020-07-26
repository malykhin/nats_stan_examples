const { hostname } = require('os')
const { connect } = require('ts-nats')
const nKeys = require('ts-nkeys')

const { N_KEY_SEED, N_KEY, NATS_URL, SUBJECT } = require('./config')

const hostName = hostname()

async function run() {
  try {
    const nc = await connect({
      url: NATS_URL,
      nkey: N_KEY,
      nonceSigner: (nonce) => nKeys.fromSeed(Buffer.from(N_KEY_SEED)).sign(Buffer.from(nonce)),
    })

    nc.on('unsubscribe', () => {
      nc.close()
    })

    nc.on('permissionError', (error) => {
      nc.close()
      console.log(`${error}`)
    })

    await nc.subscribe(
      SUBJECT,
      (error, message) => {
        if (error) {
          console.log(`[${hostName}] error processing message [${error.message} - ${message}`)
          return
        }
        if (message.reply) {
          console.log(
            `[${hostName}] received request on [${message.subject}]: ${message.data} respond to ${message.reply}`,
          )
        } else {
          console.log(`[${hostName}] received on [${message.subject}]: ${message.data}`)
        }
      },
      { queue: 'job.workers' },
    )

    nc.flush(() => {
      console.log(`[${hostName}] listening to [${SUBJECT}]`)
    })
  } catch (error) {
    console.log(error)
  }
}

run()
