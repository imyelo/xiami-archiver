const { archiveCollection, queueCollection } = require('./services/collection')
const { archiveUserFavoriteCollections, queueUserFavoriteCollections } = require('./services/user-favorite-collections')
const { queueImage } = require('./services/image')
const { sharedBrowser } = require('./libs/fetch')

;(async () => {
  // const collections = await archiveUserFavoriteCollections({ userId: 44278462 })
  // const collections = await archiveUserFavoriteCollections({ userId: 1915514 })
  // archiveCollection({ id: 1325571090 })
  await sharedBrowser.launch()
  await Promise.all([
    // queueUserFavoriteCollections(1915514),
    // queueUserFavoriteCollections(44278462),
    queueCollection(1325571090),
    queueImage('https://pic.xiami.net/xiamiWeb/670907354d0f2c58536e63cb73e76d76/af2f9ae5e133ec7240904ba36814796e-500x500.jpg@!c-185-185')
  ])
  await sharedBrowser.close()
})()
