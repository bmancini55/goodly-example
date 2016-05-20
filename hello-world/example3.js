/**
 * This example demonstrates request and response
 */

import goodly from 'goodly';

if(!process.argv[2]) {
  console.log('You must supply the broker path');
  process.exit(1);
}

// request service
(async () => {

  const service = goodly({ name: 'example3-request' });
  await service.start({ brokerPath: process.argv[2] });

  // start the ping/pong with a ping
  let result = await service.request('request', { name: 'world' });
  console.log(result);

})().catch(console.log);


// response service
(async () => {

  const service = goodly({ name: 'example3-response' });
  await service.start({ brokerPath: process.argv[2] });

  // listen for the request event and reply back
  await service.on('request', async ({ data, reply }) => {
    await reply('hello ' + data.name);
  });

})().catch(console.log);