const path = require('path')
const { URL } = require('url')
const config = require('config')
const download = require('download')
const debug = require('Debug')('xiami:service')
const createQueue = require('../libs/queue')

const CONCURRENCE = config.get('archiver.image.concurrency')
const DIST_PATH = config.get('archiver.image.path')

const queue = createQueue('IMAGE', { concurrency: CONCURRENCE })

const queueImage = async (uri) => {
  await queue.add(() => archiveImage(uri))
  debug(`[IMAGE]: 完成 ${uri}`)
}

const archiveImage = (uri) => {
  const url = new URL(uri)
  const dirname = path.dirname(url.pathname)
  return download(url, path.join(DIST_PATH, url.hostname, dirname))
}

exports.queueImage = queueImage
