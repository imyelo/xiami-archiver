const config = require('config')
const debug = require('debug')('xiami:core')
const { sharedBrowser } = require('../libs/fetch')

const run = async (application) => {
  debug('[config]', JSON.stringify(config, null, 2))
  await sharedBrowser.launch()
  await application()
  await sharedBrowser.close()
}

module.exports = run
