const { archiveFavoriteCollections } = require('./services/favorite-collections')

;(async () => {
  // const collections = await archiveFavoriteCollections({ userId: 44278462 })
  const collections = await archiveFavoriteCollections({ userId: 1915514 })
})()
