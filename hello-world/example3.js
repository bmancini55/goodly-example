/**
 * This example demonstrates request and response
 */

import goodly from 'goodly';

const brokerPath = process.argv[2] || '192.168.99.100';

// create a service to emit a request
const requestService = goodly({ name: 'example3-request' });

// create a service that listens for requests
const responseService = goodly({ name: 'example-response' });
responseService.on('request.greeting', handleRequest);

// handles when a request happens by replying a results
async function handleRequest({ data, reply }) {
  await reply('hello ' + data.name);
}


// start the services
Promise.resolve()
  .then(() => requestService.start({ brokerPath }))
  .then(() => responseService.start({ brokerPath }))
  .then(async () => {

    // make a request
    let response = await requestService.request('request.greeting', { name: 'world' });

    // output the result
    console.log('Received reply: ' + response);

  })
  .catch(console.log);
