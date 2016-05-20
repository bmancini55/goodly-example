/**
 * This example demonstrates two services emitting messages to each other.
 */

import goodly from 'goodly';

if(!process.argv[2]) {
  console.log('You must supply the broker path');
  process.exit(1);
}

// ping service
(async () => {
  let rounds = 0;

  const service = goodly({ name: 'example2-ping' });
  await service.start({ brokerPath: process.argv[2] });

  // list to the pong event and emit a ping event
  await service.on('pong', async ({ emit }) => {
    if(rounds > 5) return;

    console.log('ping');
    await emit('ping');
    rounds++;
  });

  // start the ping/pong with a ping
  service.emit('ping');

})().catch(console.log);


// pong service
(async () => {

  const service = goodly({ name: 'example2-pong' });
  await service.start({ brokerPath: process.argv[2] });

  // list to the ping event and emit a pong event
  await service.on('ping', async ({ emit }) => {
    console.log('pong');
    await emit('pong');
  });

})().catch(console.log);
