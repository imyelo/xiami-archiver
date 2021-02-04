const config = require('config')
const cheerio = require('cheerio')
const debug = require('Debug')('xiami')
const { fetchHTML, fetchJSON } = require('../libs/fetch')
const database = require('../libs/database')
const createQueue = require('../libs/queue')
const { match, nodeText, findNodeWithText } = require('../utils')

const CONCURRENCE = config.get('archiver.collection.concurrency')
const queue = createQueue('COLLECTION', { concurrency: CONCURRENCE })

const queueArchiveCollection = async (id) => {
  await queue.add(() => archiveCollection({ id }))
  debug(`[COLLECTION]: 完成 ${id}`)
}
const queueArchiveCollections = (ids) => {
  ids.forEach((id) => queueArchiveCollection(id))
}

const archiveCollection = async ({ id }) => {
  const html = await fetchHTML(`https://emumo.xiami.com/collect/${id}`)
  const items = await fetchCollectionItems({ id })
  const $ = cheerio.load(html)
  const $info = $('#info_collect .cdinfo li')
  const $author = findNodeWithText($, $info, '制作人')
  const collection = {
    title: $('#info_collect h2').text().trim(),
    introduction: $('.info_intro_full').html().trim(),
    cover: $('#info_collect .cover img').attr('src'),
    author: {
      id: match($author.find('a').attr('href'), /^\/u\/(\d+)$/),
      name: $author.find('a').text(),
    },
    items,
    count: nodeText(findNodeWithText($, $info, '歌曲数')).trim(),
    updatedAt: nodeText(findNodeWithText($, $info, '更新时间')).trim(),
  }

  await database.set(`collection:${id}`, collection)
  return collection
}

const fetchCollectionItems = async ({ id, page = 1 }) => {
  const json = await fetchJSON(`https://emumo.xiami.com/collect/ajax-get-list?id=${id}&p=${page}`)
  let items = json.result.data.map((obj) => ({
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
    const restItems = await fetchCollectionItems({ id, page: page + 1 })
    items = items.concat(restItems)
  }
  return items
}

exports.archiveCollection = archiveCollection
exports.queueArchiveCollection = queueArchiveCollection
exports.queueArchiveCollections = queueArchiveCollections
exports.queue = queue
