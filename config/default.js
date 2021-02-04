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
    warc: {
      path: path.resolve(__dirname, '../data/warc'),
    },
    image: {
      concurrency: 8,
      path: path.resolve(__dirname, '../data/images'),
    },
    collection: {
      concurrency: 2,
    },
    'user-favorite-collections': {
      concurrency: 2,
    },
  },
}
