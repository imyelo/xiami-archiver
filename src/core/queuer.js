const { queueCollection } = require('../services/collection')
const { queueSong } = require('../services/song')
const { queueUserFavoriteSongs } = require('../services/user-favorite-songs')
const { queueUserTopSongs } = require('../services/user-top-songs')
const { queueUserFavoriteCollections } = require('../services/user-favorite-collections')
const { queueUserCollections } = require('../services/user-collections')
const { queueImage } = require('../services/image')

const Queuer = {
  user: async userId => {
    await Queuer.userFavoriteCollections(userId)
    await Queuer.userCollections(userId)
    await Queuer.userFavoriteSongs(userId)
    await Queuer.userTopSongs(userId)
  },
  userFavoriteCollections: async (userId) => {
    const collections = await queueUserFavoriteCollections(userId)
    collections.forEach((collection) => Queuer.collection(collection.id))
  },
  userCollections: async (userId) => {
    const collections = await queueUserCollections(userId)
    collections.forEach((collection) => Queuer.collection(collection.id))
  },
  userFavoriteSongs: async (userId) => {
    const songs = await queueUserFavoriteSongs(userId)
    songs.forEach((song) => Queuer.song(song.id))
  },
  userTopSongs: async (userId) => {
    const songs = await queueUserTopSongs(userId)
    songs.forEach((song) => Queuer.song(song.id))
  },
  collection: async (id) => {
    const collection = await queueCollection(id)
    collection.items.forEach((item) => Queuer.song(item.song.id))
    Queuer.image(collection.cover)
  },
  song: async (id) => {
    // await queueSong(id)
  },
  image: queueImage,
}

module.exports = Queuer
