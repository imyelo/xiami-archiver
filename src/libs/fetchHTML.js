const puppeteer = require('puppeteer')
const config = require('config')

const fetchHTML = async (url) => {
  const browser = await puppeteer.launch({
    headless: config.get('puppeteer.headless'),
    userDataDir: config.get('puppeteer.userDataDir'),
  })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle2' })
  const html = await page.evaluate(() => window.document.querySelector('html').outerHTML)
  await browser.close()
  return html
}

module.exports = fetchHTML
