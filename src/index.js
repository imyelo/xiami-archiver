const { getFavoriteCollections } = require('./services/favorite-collections')

;(async () => {
  const collections = await getFavoriteCollections({ userId: 1915514 })
})()
