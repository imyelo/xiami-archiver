const _ = require('lodash')
const config = require('config')
const cheerio = require('cheerio')
const debug = require('Debug')('xiami:service')
const { default: PQueue } = require('p-queue')
const { fetchHTML } = require('../libs/fetch')
const database = require('../libs/database')
const createQueue = require('../libs/queue')
const { match, trim } = require('../utils')

const PAGINATION_CONCURRENCE = 1
const PAGE_SIZE = 25

const CONCURRENCE = config.get('archiver.user-top-songs.concurrency')
const { add: queueUserTopSongs } = createQueue('TOP-SONGS', { concurrency: CONCURRENCE }, userId => archiveUserTopSongs(userId))

const archiveUserTopSongs = async (userId) => {
  const log = message => debug(`[TOP-SONGS] [用户 ${userId}]: ${message}`)
  const html = await fetchHTML(`https://emumo.xiami.com/space/charts/u/${userId}/c/song/t/all`)
  const $ = cheerio.load(html)
  const count = match($('.all_page > span').text(), /^\(第\d+页, 共(\d+)条\)$/)
  const pages = Math.ceil(count / PAGE_SIZE)
  await database.set(`user-top-songs:${userId}:count`, {
    count,
    pages,
  })
  log(`总数: ${count}. 总页数: ${pages}.`)
  const queue = new PQueue({ concurrency: PAGINATION_CONCURRENCE })
  _.range(1, pages + 1).forEach(async page => {
    await queue.add(() => archiveUserTopSongsWithPage(userId, page))
    log(`完成页码: ${page}`)
  })
  await queue.onIdle()
  log(`全部完成`)
}

const archiveUserTopSongsWithPage = async (userId, page = 1) => {
  const html = await fetchHTML(`https://emumo.xiami.com/space/charts/u/${userId}/c/song/t/all/page/${page}`)
  const $ = cheerio.load(html)
  const songs = $('.track_list tr')
    .map((_, element) => {
      const $element = $(element)
      const $author = $element.find('.song_name .artist_name')
      return {
        id: $element.find('.chkbox input').val(),
        name: $element.find('.song_name a').eq(0).text(),
        author: {
          id: match($author.attr('href'), /^(?:\/\/emumo\.xiami\.com)?\/artist\/(.+?)(?:\?.*)?$/),
          name: trim($author.text()),
        },
        hot: +$element.find('.song_hot').text(),
      }
    })
    .get()
  await database.set(`user-top-songs:${userId}:page:${page}`, songs)
  return songs
}

exports.archiveUserTopSongs = archiveUserTopSongs
exports.queueUserTopSongs = queueUserTopSongs
