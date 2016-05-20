/**
 * This example demonstrates using the HTTP transport
 */

import goodly from 'goodly';

if(!process.argv[2]) {
  console.log('You must supply the broker path');
  process.exit(1);
}

// service that will receive data via HTTP
(async () => {

  const service = goodly({ name: 'example5-listener' });
  await service.set('transport', goodly.httpTransport());
  await service.start({ brokerPath: process.argv[2] });

  await service.on('example5', async({ data }) => {
    console.log(data);
  });

})().catch(console.log);


// service that will send data via HTT{
(async () => {

  const service = goodly({ name: 'example5-emitter' });
  await service.set('transport', goodly.httpTransport());
  await service.start({ brokerPath: process.argv[2] });

  service.emit('example5', 'helllllo world, this was HTTP');

})().catch(console.log);