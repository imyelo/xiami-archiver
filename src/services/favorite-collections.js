const _ = require('lodash')
const config = require('config')
const cheerio = require('cheerio')
const debug = require('Debug')('xiami')
const { default: PQueue } = require('p-queue')
const fetchHTML = require('../libs/fetchHTML')
const database = require('../libs/database')
const { extractRegexp } = require('../utils')

const CONCURRENCE = config.get('fetcher.concurrency')
const PAGE_SIZE = 12

const archiveFavoriteCollections = async ({ userId }) => {
  const log = (message) => debug(`[FAVORITE-COLLECTIONS] [用户 ${userId}]: ${message}`)
  const html = await fetchHTML(`https://emumo.xiami.com/space/collect-fav/u/${userId}`)
  const $ = cheerio.load(html)
  const count = extractRegexp($('.all_page > span').text(), /^\(第\d+页, 共(\d+)条\)$/)
  const pages = Math.ceil(count / PAGE_SIZE)
  await database.set(`favorite-collections:${userId}:count`, {
    count,
    pages,
  })
  log(`总数: ${count}. 总页数: ${pages}.`)
  const queue = new PQueue({ concurrency: CONCURRENCE });
  _.range(1, pages + 1).forEach(async (page) => {
    await queue.add(() => archiveFavoriteCollectionsWithPage({ userId, page }))
    log(`完成页码: ${page}`)
  })
  await queue.onIdle()
  log(`全部完成`)
}

const archiveFavoriteCollectionsWithPage = async ({ userId, page = 1 }) => {
  const html = await fetchHTML(`https://emumo.xiami.com/space/collect-fav/u/${userId}/order//page/${page}`)
  const $ = cheerio.load(html)
  const collections = $('.collectThread_list li').map((_, element) => {
    const $element = $(element)
    const $info = $element.find('.info')
    return {
      id: extractRegexp($info.find('.detail .name > b > a').attr('onclick'), /^playcollect\('(.*)'\)$/),
      name: $info.find('.detail .name > a').text(),
      cover: $info.find('.info .cover img').attr('src'),
      author: {
        id: extractRegexp($info.find('.detail .author a').attr('href'), /^\/u\/(\d+)/),
        name: $info.find('.detail .author a').text(),
      },
      tags: $element.find('.tag_block .hot0').map((_, element) => $(element).text()).get(),
      count: +extractRegexp($info.find('.detail .name').clone().children().remove().end().text(), /^\((\d+)\)$/),
      updatedAt: extractRegexp($info.find('.detail .author .time').text(), /^更新于:(\d{4}-\d{2}-\d{2})$/),
    }
  }).get()
  await database.set(`favorite-collections:${userId}:${page}`, collections)
  return collections
}

exports.archiveFavoriteCollections = archiveFavoriteCollections
