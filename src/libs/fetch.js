const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const config = require('config')

const sharedBrowser = (() => {
  let instance = null
  const launch = async () => {
    instance = await puppeteer.launch({
      headless: config.get('puppeteer.headless'),
      userDataDir: config.get('puppeteer.userDataDir'),
    })
  }
  const close = async () => {
    await instance.close()
    instance = null
  }
  return {
    instance,
    launch,
    close,
  }
})()

const fetchHTML = async (url) => {
  const browser = sharedBrowser.instance || await puppeteer.launch({
    headless: config.get('puppeteer.headless'),
    userDataDir: config.get('puppeteer.userDataDir'),
  })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle2' })
  const html = await page.evaluate(() => window.document.querySelector('html').outerHTML)
  await page.close();
  if (!sharedBrowser.instance) {
    await browser.close()
  }
  return html
}

const fetchJSON = async url => {
  const html = await fetchHTML(url)
  return JSON.parse(cheerio.load(html)('body').text())
}

exports.sharedBrowser = sharedBrowser
exports.fetchHTML = fetchHTML
exports.fetchJSON = fetchJSON
