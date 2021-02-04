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
    sharedBrowser: {
      enabled: true,
    },
    warc: {
      enabled: false,
      path: path.resolve(__dirname, '../data/warc'),
    },
    image: {
      concurrency: 8,
      path: path.resolve(__dirname, '../data/images'),
    },
    'user-favorite-collections': {
      concurrency: 2,
    },
    collection: {
      concurrency: 2,
    },
    'user-favorite-songs': {
      concurrency: 2,
    },
    'user-top-songs': {
      concurrency: 2,
    },
    song: {
      concurrency: 2,
    },
  },
}
