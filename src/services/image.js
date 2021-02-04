const path = require('path')
const { URL } = require('url')
const config = require('config')
const download = require('download')
const debug = require('Debug')('xiami')
const { default: PQueue } = require('p-queue')

const CONCURRENCE = config.get('archiver.image.concurrency')
const DIST_PATH = config.get('archiver.image.path')

const queue = new PQueue({ concurrency: CONCURRENCE });
queue.on('add', () => {
	debug(`[COLLECTION QUEUE]: Size: ${queue.size}. Pending: ${queue.pending}.`);
});
queue.on('next', () => {
	debug(`[COLLECTION QUEUE]: Size: ${queue.size}. Pending: ${queue.pending}.`);
});

const queueImage = async (uri) => {
  const url = new URL(uri)
  const dirname = path.dirname(url.pathname)
  await queue.add(() => download(url, path.join(DIST_PATH, url.hostname, dirname)))
  debug(`[IMAGE]: 完成 ${url}`)
}

exports.queueImage = queueImage
