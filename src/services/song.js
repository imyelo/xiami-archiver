const config = require('config')
const cheerio = require('cheerio')
const { fetchHTML } = require('../libs/fetch')
const database = require('../libs/database')
const createQueue = require('../libs/queue')
const { match, findNodeWithText, trim } = require('../utils')

const CONCURRENCE = config.get('archiver.song.concurrency')
const { add: queueSong } = createQueue('SONG', { concurrency: CONCURRENCE }, id => archiveSong(id))

const archiveSong = async id => {
  const key = `song:${id}`
  const existed = await database.get(key)
  if (existed) {
    return existed
  }
  const html = await fetchHTML(`https://emumo.xiami.com/song/${id}`)
  const $ = cheerio.load(html)
  const $info = $('#albums_info tr')
  const $album = findNodeWithText($, $info, '所属专辑').find('td:last-child')
  const $singer = findNodeWithText($, $info, '演唱者').find('td:last-child')
  const $writer = findNodeWithText($, $info, '作词').find('td:last-child')
  const $composer = findNodeWithText($, $info, '作曲').find('td:last-child')
  const song = {
    id,
    title: $('#title h1').text(),
    album: {
      id: match($album.find('a').attr('href'), /^\/album\/(.+?)(?:\?.*)?$/),
      name: trim($album.text()),
    },
    singer: {
      id: match($singer.find('a').attr('href'), /^\/artist\/(.+?)(?:\?.*)?$/),
      name: trim($singer.text()),
    },
    writer: {
      id: match($writer.find('a').attr('href'), /^\/artist\/(.+?)(?:\?.*)?$/),
      name: trim($writer.text()),
    },
    composer: {
      id: match($composer.find('a').attr('href'), /^\/artist\/(.+?)(?:\?.*)?$/),
      name: trim($composer.text()),
    },
    lyric: trim($('.lrc_main').html()),
  }
  await database.set(key, song)
  return song
}

exports.archiveSong = archiveSong
exports.queueSong = queueSong
