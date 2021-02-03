const cheerio = require('cheerio')
const fetchHTML = require('../libs/fetchHTML')
const { extractRegexp } = require('../utils')

const getFavoriteCollections = async () => {
  const html = await fetchHTML('https://emumo.xiami.com/space/collect-fav/u/1915514')
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
      tags: $element.find('.tag_block .hot0').map((_, element) => $(element).text()).get()
    }
  }).get()
  console.log(collections)
}

exports.getFavoriteCollections = getFavoriteCollections
