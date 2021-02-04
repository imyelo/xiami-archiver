const path = require('path')

module.exports = {
  puppeteer: {
    headless: true,
    userDataDir: path.resolve(__dirname, '../.chrome/profile'),
    defaultViewport: {
      width: 1280,
      height: 960,
    },
  },
  keyv: {
    uri: `sqlite://${path.resolve(__dirname, '../data/keyv.sqlite')}`,
  },
  archiver: {
    sharedBrowser: {
      enabled: true,
    },
    snapshot: {
      enabled: true,
      path: path.resolve(__dirname, '../data/snapshot'),
    },
    image: {
      concurrency: 8,
      path: path.resolve(__dirname, '../data/images'),
    },
    'user-favorite-collections': {
      concurrency: 8,
    },
    'user-collections': {
      concurrency: 8,
    },
    collection: {
      concurrency: 8,
    },
    'user-favorite-songs': {
      concurrency: 8,
    },
    'user-top-songs': {
      concurrency: 8,
    },
    song: {
      concurrency: 50,
    },
  },
}
