import express from 'express';
import bodyParser from 'body-parser';
import goodly from 'goodly';
import debugModule from 'debug';
import config from './config.json';

const debug = debugModule('gateway');

// bootstrap the gateway service
let ms = goodly({ name: 'gateway' });
ms.set('cache', goodly.redisCache({ redisUrl: config.redis.url }));
ms.set('transport', goodly.httpTransport({ httpHost: config.httpTransport.host }));
ms.start({ brokerPath: config.rabbit.brokerPath }).catch(e => console.log(e.stack));

// create the express endpoints
let app = express();
app.use(bodyParser.json());
app.post('/api/previews', (req, res, next) => createPreviews(req, res).catch(next));

// start express
app.listen(config.gateway.port, () => debug('express listening on port %d', config.gateway.port));


/**
 * POST /api/previews
 * Handles HTTP requests for creating a previews record
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
async function createPreviews(req, res) {
  await ms.emit('previews.uploaded', req.body);
  // TODO - what if we want to return a result from here?
  //        could we add a wait method that waits for events
  //        based on a correlation?
  //        could we add the emitter as a request/response
  //        instead of a broadcast event?
  res.send('Success');
}