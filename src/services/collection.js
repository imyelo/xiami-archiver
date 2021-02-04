const config = require('config')
const cheerio = require('cheerio')
const { fetchHTML, fetchJSON } = require('../libs/fetch')
const database = require('../libs/database')
const createQueue = require('../libs/queue')
const { match, nodeText, findNodeWithText, trim } = require('../utils')

const CONCURRENCE = config.get('archiver.collection.concurrency')
const { add: queueCollection } = createQueue('COLLECTION', { concurrency: CONCURRENCE }, id => archiveCollection(id))

const archiveCollection = async id => {
  const html = await fetchHTML(`https://emumo.xiami.com/collect/${id}`)
  const items = await fetchCollectionItems(id)
  const $ = cheerio.load(html)
  const $info = $('#info_collect .cdinfo li')
  const $author = findNodeWithText($, $info, '制作人')
  const collection = {
    title: trim($('#info_collect h2').text()),
    introduction: trim($('.info_intro_full').html()),
    cover: $('#info_collect .cover img').attr('src'),
    author: {
      id: match($author.find('a').attr('href'), /^\/u\/(\d+)$/),
      name: $author.find('a').text(),
    },
    items,
    count: trim(nodeText(findNodeWithText($, $info, '歌曲数'))),
    updatedAt: trim(nodeText(findNodeWithText($, $info, '更新时间'))),
  }

  await database.set(`collection:${id}`, collection)
  return collection
}

const fetchCollectionItems = async (id, page = 1) => {
  const json = await fetchJSON(`https://emumo.xiami.com/collect/ajax-get-list?id=${id}&p=${page}`)
  let items = json.result.data.map(obj => ({
    ordering: obj.ordering,
    description: obj.description,
    song: {
      id: obj.song_id,
      name: obj.name,
      artist: {
        id: obj.artist_id,
        name: obj.artist_name,
      },
    },
    _raw: obj,
  }))
  if (page < json.result.total_page) {
    const restItems = await fetchCollectionItems(id, page + 1)
    items = items.concat(restItems)
  }
  return items
}

exports.archiveCollection = archiveCollection
exports.queueCollection = queueCollection
