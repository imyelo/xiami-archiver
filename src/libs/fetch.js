const path = require('path')
const fs = require('fs-extra')
const puppeteer = require('puppeteer')
const hasha = require('hasha')
const config = require('config')
const makeDir = require('make-dir')
const { PuppeteerWARCGenerator, PuppeteerCapturer } = require('node-warc')

const PUPPETEER_HEADLESS = config.get('puppeteer.headless')
const PUPPETEER_USER_DATA_DIR = config.get('puppeteer.userDataDir')
const PUPPETEER_DEFAULT_VIEWPORT = config.get('puppeteer.defaultViewport')
const PUPPETEER_PROXY = config.get('puppeteer.proxy')

const SHARED_BROWSER_ENABLED = config.get('archiver.sharedBrowser.enabled')
const SNAPSHOT_ENABLED = config.get('archiver.snapshot.enabled')
const SNAPSHOT_PATH = config.get('archiver.snapshot.path')

const createBrowser = () => puppeteer.launch({
    headless: PUPPETEER_HEADLESS,
    userDataDir: PUPPETEER_USER_DATA_DIR,
    defaultViewport: PUPPETEER_DEFAULT_VIEWPORT,
    args: [PUPPETEER_PROXY && `--proxy-server=${PUPPETEER_PROXY}`].filter(Boolean),
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
      const url = page.url()
      const key = hasha(url)
      const dirname = path.join(SNAPSHOT_PATH, key)
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
      await page.screenshot({ path: path.join(dirname, 'screenshot.png'), fullPage: true })
      await fs.writeJSON(path.join(dirname, 'archive.json'), {
        key,
        url,
        createdAt: Date.now(),
      })
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
