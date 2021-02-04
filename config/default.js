const path = require('path')

module.exports = {
  puppeteer: {
    headless: true,
    userDataDir: path.resolve(__dirname, '../.chrome/profile'),
  },
  keyv: {
    uri: `sqlite://${path.resolve(__dirname, '../data/keyv.sqlite')}`,
  },
  archiver: {
    common: {
      concurrency: 2,
    },
    collection: {
      concurrency: 2,
    },
  },
}
