/**
 * This example demonstrates listening middleware
 */

import goodly from 'goodly';

const brokerPath = process.argv[2] || '192.168.99.100';

// create service and attach multiple methods to the same event
const service = goodly({ name: 'example4' });
service.on('example4', middleware1);
service.on('example4', middleware2);
service.on('example4', listener);


// add some logging as our first handler
async function middleware1(event, next) {
  console.log('before');
  await next();
  console.log('after');
}

// create a greeting that gets attached to our event
async function middleware2(event, next) {
  event.greeting = 'hello';
  await next();
}

// output the full greeting from our middleware
async function listener({ data, greeting }) {
  console.log(`${greeting} ${data}`);
}


// start the service
service
  .start({ brokerPath })
  .then(async () => {
    // emit the example4 event
    await service.emit('example4', 'world');
  })
  .catch(console.log);
