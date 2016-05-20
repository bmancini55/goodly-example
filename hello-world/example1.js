/**
 * This example demonstrates a listening for an event
 */

import goodly from 'goodly';

if(!process.argv[2]) {
  console.log('You must supply the broker path');
  process.exit(1);
}

// async IIFE wraps the service start so that we can use
// ES7 async/await functionality
(async () => {

  // create the service called example1 and
  // connect to the message broker based on the first command line argument
  const service = goodly({ name: 'example1' });
  await service.start({ brokerPath: process.argv[2] });

  // listen to an event called 'first'
  await service.on('first', ({ data }) => {
    console.log(`\nI received: ${data}\n`);
  });

  // emit some data to the first event
  await service.emit('first', 'hello world');

})().catch(console.log);