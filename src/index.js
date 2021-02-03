const fetchHTML = require('./libs/fetchHTML')

;(async () => {
  const html = await fetchHTML('https://emumo.xiami.com/space/collect-fav/u/1915514')
  console.log(html)
})()
