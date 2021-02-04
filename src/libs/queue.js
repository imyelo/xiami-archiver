const debug = require('Debug')('xiami:queue')
const { default: PQueue } = require('p-queue')

const createQueue = (name, options, fn) => {
  const queue = new PQueue(options);
  queue.on('add', () => {
    debug(`[${name}]: Size: ${queue.size}. Pending: ${queue.pending}.`);
  });
  queue.on('next', () => {
    debug(`[${name}]: Size: ${queue.size}. Pending: ${queue.pending}.`);
  });

  const add = async (...args) => {
    let result = null
    await queue.add(async () => {
      result = await fn(...args)
    })
    debug(`[${name}]: 完成 ${JSON.stringify(args)}`)
    return result
  }

  return { queue, add }
}

module.exports = createQueue
