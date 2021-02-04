const { URL } = require('url')
const path = require('path')
const Keyv = require('keyv')
const config = require('config')
const makeDir = require('make-dir')

const uri = config.get('keyv.uri')

const url = new URL(uri)
if (url.protocol === 'sqlite:') {
  makeDir.sync(path.dirname(url.pathname))
}

const keyv = new Keyv(config.get('keyv.uri'))

keyv.on('error', (error) => {
  console.error(error)
})

module.exports = keyv
