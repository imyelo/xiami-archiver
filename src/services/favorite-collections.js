const cheerio = require('cheerio')
const fetchHTML = require('../libs/fetchHTML')
const database = require('../libs/database')
const { extractRegexp } = require('../utils')

const getFavoriteCollections = async ({ userId, page = 1 }) => {
  const html = await fetchHTML(`https://emumo.xiami.com/space/collect-fav/u/${userId}/order/page/${page}`)
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
  console.log(collections)
  await database.set(`favorite-collections:${userId}:${page}`, collections)
}

exports.getFavoriteCollections = getFavoriteCollections
