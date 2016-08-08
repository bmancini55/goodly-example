/**
 * This example demonstrates two services emitting messages to each other.
 */

import goodly from 'goodly';

const brokerPath = process.argv[2] || '192.168.99.100';

// create the ping service
const pingService = goodly({ name: 'example2-ping' });
pingService.on('pong', onPong);

// create the pong service
const pongService = goodly({ name: 'example2-pong' });
pongService.on('ping', onPing);

// start the services
Promise.resolve()
  .then(() => pingService.start({ brokerPath }))
  .then(() => pongService.start({ brokerPath }))
  .then(() => console.log('services have started!'))
  .then(() => pongService.emit('pong'))
  .catch(console.log);

// handler for pong events
async function onPong({ emit }) {
  setTimeout(() => {
    console.log('ping');
    emit('ping');
  }, 500);
}

// handler for ping events
async function onPing({ emit }) {
  setTimeout(() => {
    console.log('pong');
    emit('pong');
  }, 500);
}