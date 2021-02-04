const { queueCollection } = require('../services/collection')
const { queueSong } = require('../services/song')
const { queueUserFavoriteSongs } = require('../services/user-favorite-songs')
const { queueUserTopSongs } = require('../services/user-top-songs')
const { queueUserFavoriteCollections } = require('../services/user-favorite-collections')
const { queueUserCollections } = require('../services/user-collections')
const { queueImage } = require('../services/image')

const Queuer = {
  userFavoriteCollections: queueUserFavoriteCollections,
  userFavoriteSongs: queueUserFavoriteSongs,
  userTopSongs: queueUserTopSongs,
  userCollections: queueUserCollections,
  collection: queueCollection,
  song: queueSong,
  image: queueImage,
}

module.exports = Queuer
