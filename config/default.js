const path = require('path')

module.exports = {
  puppeteer: {
    headless: true,
    userDataDir: path.resolve(__dirname, '../.chrome/profile'),
    defaultViewport: {
      width: 1280,
      height: 960,
    },
    proxy: '', // e.g.: http://127.0.0.1:8899
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
      concurrency: 1,
    },
    'user-collections': {
      concurrency: 1,
    },
    collection: {
      concurrency: 1,
    },
    'user-favorite-songs': {
      concurrency: 1,
    },
    'user-top-songs': {
      concurrency: 1,
    },
    song: {
      concurrency: 1,
    },
  },
}
