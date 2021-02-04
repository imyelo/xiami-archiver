const path = require('path')
const puppeteer = require('puppeteer')
const config = require('config')
const makeDir = require('make-dir')
const { PuppeteerWARCGenerator, PuppeteerCapturer } = require('node-warc')

const SHARED_BROWSER_ENABLED = config.get('archiver.sharedBrowser.enabled')
const SNAPSHOT_ENABLED = config.get('archiver.snapshot.enabled')
const SNAPSHOT_PATH = config.get('archiver.snapshot.path')

const createBrowser = () => puppeteer.launch({
    headless: config.get('puppeteer.headless'),
    userDataDir: config.get('puppeteer.userDataDir'),
    defaultViewport: config.get('puppeteer.defaultViewport'),
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

const createSnapshot = (page) => {
  if (!SNAPSHOT_ENABLED) {
    return {
      generate: () => {},
    }
  }
  const cap = new PuppeteerCapturer(page, 'request')
  cap.startCapturing()
  return {
    generate: async () => {
      const warcGen = new PuppeteerWARCGenerator()
      const dirname = path.join(SNAPSHOT_PATH, String(Date.now()))
      await makeDir(dirname)
      await warcGen.generateWARC(cap, {
        warcOpts: {
          warcPath: path.join(dirname, 'archive.warc')
        },
        winfo: {
          description: `URL: ${page.url()} .Archived by Yelo`,
          isPartOf: 'Xiami Archive',
        },
      })
      await page.screenshot({ path: path.join(dirname, 'screenshot.png')})
    },
  }
}

const fetchHTML = async (url) => {
  const browser = sharedBrowser.instance() || await createBrowser()
  const page = await browser.newPage()
  const snapshot = createSnapshot(page)
  const response = await page.goto(url, { waitUntil: 'networkidle2' })
  const html = await response.text()
  await snapshot.generate()
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
