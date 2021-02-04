const { archiveUserFavoriteCollections } = require('./services/user-favorite-collections')

;(async () => {
  // const collections = await archiveUserFavoriteCollections({ userId: 44278462 })
  const collections = await archiveUserFavoriteCollections({ userId: 1915514 })
})()
