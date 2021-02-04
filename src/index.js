const { archiveCollection, queueArchiveCollections } = require('./services/collection')
const { archiveUserFavoriteCollections } = require('./services/user-favorite-collections')

;(async () => {
  // const collections = await archiveUserFavoriteCollections({ userId: 44278462 })
  // const collections = await archiveUserFavoriteCollections({ userId: 1915514 })
  // archiveCollection({ id: 1325571090 })
  queueArchiveCollections([1325571090])
})()
