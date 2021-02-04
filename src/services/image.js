const path = require('path')
const { URL } = require('url')
const pathExists = require('path-exists')
const config = require('config')
const download = require('download')
const createQueue = require('../libs/queue')

const CONCURRENCE = config.get('archiver.image.concurrency')
const DIST_PATH = config.get('archiver.image.path')

const { add: queueImage } = createQueue('IMAGE', { concurrency: CONCURRENCE }, (uri) => archiveImage(uri))

const archiveImage = async (uri) => {
  const url = new URL(uri)
  const dirname = path.join(DIST_PATH, url.hostname, path.dirname(url.pathname))
  const isExisted = await pathExists(path.join(dirname, path.basename(url.pathname)))
  if (!isExisted) {
    await download(url, dirname)
  }
}

exports.queueImage = queueImage
