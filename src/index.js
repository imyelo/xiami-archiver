const { getFavoriteCollections } = require('./services/favorite-collections')

;(async () => {
  const collections = await getFavoriteCollections()
})()
