import express from 'express';
import bodyParser from 'body-parser';
import goodly from 'goodly';
import debugModule from 'debug';

const debug = debugModule('gateway-service');

// bootstrap the gateway service
let ms = goodly({ name: 'gateway' });
ms.set('cache', goodly.redisCache({ redisUrl: process.env.REDIS }));
ms.set('transport', goodly.httpTransport({ httpHost: process.env.HTTPHOST }));
ms.start({ brokerPath: process.env.RABBIT }).catch(e => console.log(e.stack));

// create the express endpoints
let app = express();
app.use(bodyParser.json());
app.post('/previews', (req, res, next) => createPreviews(req, res).catch(next));

// start express
app.listen(5050, () => debug('express listening on port 5050'));



async function createPreviews(req, res) {
  await ms.emit('previews.uploaded', req.body);
  // TODO - what if we want to return a result from here?
  //        could we add a wait method that waits for events
  //        based on a correlation?
  //        could we add the emitter as a request/response
  //        instead of a broadcast event?
  res.send('Success');
}