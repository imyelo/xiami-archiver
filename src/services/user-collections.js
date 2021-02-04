const _ = require('lodash')
const config = require('config')
const cheerio = require('cheerio')
const debug = require('Debug')('xiami:service')
const { default: PQueue } = require('p-queue')
const { fetchHTML } = require('../libs/fetch')
const database = require('../libs/database')
const createQueue = require('../libs/queue')
const { match, nodeText } = require('../utils')

const PAGINATION_CONCURRENCE = 1
const PAGE_SIZE = 12

const CONCURRENCE = config.get('archiver.user-collections.concurrency')
const { add: queueUserCollections } = createQueue('USER-COLLECTION', { concurrency: CONCURRENCE }, userId =>
  archiveUserCollections(userId)
)

const archiveUserCollections = async userId => {
  const log = message => debug(`[USER-COLLECTIONS] [用户 ${userId}]: ${message}`)
  const html = await fetchHTML(`https://emumo.xiami.com/space/collect-fav/u/${userId}`)
  const $ = cheerio.load(html)
  const count = match($('.all_page > span').text(), /^\(第\d+页, 共(\d+)条\)$/)
  const pages = Math.ceil(count / PAGE_SIZE)
  await database.set(`user-collections:${userId}:count`, {
    count,
    pages,
  })
  log(`总数: ${count}. 总页数: ${pages}.`)
  const queue = new PQueue({ concurrency: PAGINATION_CONCURRENCE })
  const collectionsByPage = new Map()
  _.range(1, pages + 1).forEach(async page => {
    await queue.add(async () => {
      const collections = await archiveUserCollectionsWithPage(userId, page)
      collectionsByPage.set(page, collections)
    })
    log(`完成页码: ${page}`)
  })
  await queue.onIdle()
  log(`全部完成`)
  return _.flatten(
    _.sortBy(
      Array.from(collectionsByPage.entries()).map(([page, collections]) => ({ page, collections })),
      'page'
    ).map(({ collections }) => collections)
  )
}

const archiveUserCollectionsWithPage = async (userId, page = 1) => {
  const html = await fetchHTML(`https://emumo.xiami.com/space/collect-fav/u/${userId}/order//page/${page}`)
  const $ = cheerio.load(html)
  const collections = $('.collectThread_list li')
    .map((_, element) => {
      const $element = $(element)
      const $info = $element.find('.info')
      return {
        id: match($info.find('.detail .name > b > a').attr('onclick'), /^playcollect\('(.*)'\)$/),
        name: $info.find('.detail .name > a').text(),
        cover: $info.find('.info .cover img').attr('src'),
        author: {
          id: userId,
        },
        tags: $element
          .find('.tag_block .hot0')
          .map((_, element) => $(element).text())
          .get(),
        count: +match(nodeText($info.find('.detail .name')), /^\((\d+)\)$/),
        updatedAt: match($info.find('.detail .author .time').text()),
      }
    })
    .get()
  await database.set(`user-collections:${userId}:page:${page}`, collections)
  return collections
}

exports.archiveUserCollections = archiveUserCollections
exports.queueUserCollections = queueUserCollections
