const pAll = require('p-all')
const Queuer = require('./queuer')
const run = require('./run')

const CHILD_CONCURRENCE = 1

const archiveByUser = async (userId) => {
  const favoriteCollections = await Queuer.userFavoriteCollections(userId)
  const collections = await pAll(favoriteCollections.map((collection) => () => Queuer.collection(collection.id)), { concurrency: CHILD_CONCURRENCE })
  // const favoriteSongs = await Queuer.userFavoriteSongs(userId)
  // const topSongs = await Queuer.userTopSongs(userId)
  console.log(collections)
  // await Queuer.collection(1318881328)
}

run(async () => {
  await archiveByUser(1915514)
})
