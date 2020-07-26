const { argv } = require('yargs')

switch (argv.mode) {
  case 'produce':
    require('./src/producer')
    break
  case 'consume':
    require('./src/consumer')
    break
  case 'stan_produce':
    require('./src/stanProduce')
    break
  case 'stan_consume':
    require('./src/stanConsumer')
    break
  default:
    throw new Error('WTF')
}
