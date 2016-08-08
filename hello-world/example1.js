/**
 * This example demonstrates a listening for an event
 */

import goodly from 'goodly';

const brokerPath = process.argv[2] || '192.168.99.100';

// create a goodly service
const service = goodly({ name: 'example1' });

// attach a listener to an event named 'first'
service.on('first', async ({ data }) => {
  console.log(`\n I received: ${data}\n`);
});

// start the service by connecting to RabbitMQ
service
  .start({ brokerPath })
  // then once started...
  .then((service) => {
    // emit our first event into the broker
    let event = 'first';
    let data  = 'hello world';
    service.emit(event, data);
  });