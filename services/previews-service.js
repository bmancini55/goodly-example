import goodly from 'goodly';
import mongo from 'mongo-helper';
import debugModule from 'debug';
import config from '../config.json';

const debug = debugModule('previews');


// TODO - find a better way to allow await statements and error trapping
//        possible solution would be implementing setup as a callback function
//        that exports for testability?
(async () => {

  const db = await mongo.connect({ url: config.mongo.url });
  const collection = db.collection('previews');
  debug('connected to %s', config.mongo.url);

  let ms = goodly({ name: 'previews' });
  await ms.set('cache', goodly.redisCache({ redisUrl: config.redis.url }));
  await ms.set('transport', goodly.httpTransport({ httpHost: config.httpTransport.host }));
  await ms.set('mongo', collection);
  await ms.start({ brokerPath: config.rabbit.brokerPath });

  // Bind previews.uploaded
  await ms.on('previews.uploaded', previewsUploaded);

})().catch(e => console.log(e.stack));


/**
 * EVENT previews.uploaded
 * Handles when a previews record has been uploaded
 * @param  {[type]} data         [description]
 * @param  {[type]} options.ctx  [description]
 * @param  {[type]} options.emit [description]
 * @return {[type]}              [description]
 */
async function previewsUploaded({ service, emit, data }) {
  let collection = await service.get('mongo');

  // pesist the record
  let filter  = { _id: data.previews_no };
  let update  = { $set: data };
  let options = { upsert: true, returnOriginal: false };
  let result  = await collection.findOneAndUpdateAsync(filter, update, options);

  // emit preview record
  if(result.ok) {
    emit('previews.available', result.value);
  }
}