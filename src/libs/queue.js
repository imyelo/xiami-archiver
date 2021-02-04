const debug = require('Debug')('xiami:queue')
const { default: PQueue } = require('p-queue')

const createQueue = (name, options) => {
  const queue = new PQueue(options);
  queue.on('add', () => {
    debug(`[${name}]: Size: ${queue.size}. Pending: ${queue.pending}.`);
  });
  queue.on('next', () => {
    debug(`[${name}]: Size: ${queue.size}. Pending: ${queue.pending}.`);
  });
  return queue  
}

module.exports = createQueue
