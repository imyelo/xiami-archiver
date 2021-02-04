const { sharedBrowser } = require('../libs/fetch')

const run = async (application) => {
  await sharedBrowser.launch()
  await application()
  await sharedBrowser.close()
}

module.exports = run
