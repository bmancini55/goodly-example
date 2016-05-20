/**
 * This example demonstrates listening middleware
 */

import goodly from 'goodly';

if(!process.argv[2]) {
  console.log('You must supply the broker path');
  process.exit(1);
}


(async () => {

  const service = goodly({ name: 'example4' });
  await service.start({ brokerPath: process.argv[2] });

  // add some logging as our first handler
  await service.on('example4', async (event, next) => {
    console.log('before');
    await next();
    console.log('after');
  });

  // create a greeting in our next layer
  await service.on('example4', async (event, next) => {
    event.greeting = 'hello';
    await next();
  });

  // output the stuff in our last handlr
  await service.on('example4', async ({ data, greeting }) => {
    console.log(`${greeting} ${data}`);
  });

  // emit our event
  await service.emit('example4', 'world');

})().catch(console.log);
