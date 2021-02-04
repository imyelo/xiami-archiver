const path = require('path')
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const config = require('config')
const makeDir = require('make-dir')
const { PuppeteerWARCGenerator, PuppeteerCapturer } = require('node-warc')

const SHARED_BROWSER_ENABLED = config.get('archiver.sharedBrowser.enabled')
const WARC_ENABLED = config.get('archiver.warc.enabled')
const WARC_PATH = config.get('archiver.warc.path')

const createBrowser = () => puppeteer.launch({
    headless: config.get('puppeteer.headless'),
    userDataDir: config.get('puppeteer.userDataDir'),
  })

const sharedBrowser = (() => {
  let instance = null
  const launch = async () => {
    instance = await createBrowser()
  }
  const close = async () => {
    await instance.close()
    instance = null
  }
  return {
    instance: () => SHARED_BROWSER_ENABLED && instance,
    launch,
    close,
  }
})()

const createArchiver = (page) => {
  if (!WARC_ENABLED) {
    return {
      generate: () => {},
    }
  }
  const cap = new PuppeteerCapturer(page, 'request')
  cap.startCapturing()
  return {
    generate: async () => {
      const warcGen = new PuppeteerWARCGenerator()
      await makeDir(WARC_PATH)
      await warcGen.generateWARC(cap, {
        warcOpts: {
          warcPath: path.resolve(WARC_PATH, `${Date.now()}.warc`)
        },
        winfo: {
          description: `URL: ${page.url()} .Archived by Yelo`,
          isPartOf: 'Xiami Archive',
        },
      })
    },
  }
}

const fetchHTML = async (url) => {
  const browser = sharedBrowser.instance() || await createBrowser()
  const page = await browser.newPage()
  const archiver = createArchiver(page)
  const response = await page.goto(url, { waitUntil: 'networkidle2' })
  const html = await response.text()
  await archiver.generate()
  await page.close();
  if (!sharedBrowser.instance()) {
    await browser.close()
  }
  return html
}

const fetchJSON = async (url) => {
  const content = await fetchHTML(url)
  return JSON.parse(content)
}

exports.sharedBrowser = sharedBrowser
exports.fetchHTML = fetchHTML
exports.fetchJSON = fetchJSON
