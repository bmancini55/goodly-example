import goodly from 'goodly';
import mongo from 'mongo-helper';
import debugModule from 'debug';

const debug = debugModule('previews-service');

// TODO - find a better way to allow await statements and error trapping
//        possible solution would be implementing setup as a callback function
//        that exports for testability?
(async () => {

  const db = await mongo.connect({ url: process.env.MONGO });
  const collection = db.collection('previews');
  debug('connected to %s', process.env.MONGO);

  let ms = goodly({ name: 'previews' });
  await ms.set('cache', goodly.redisCache({ redisUrl: process.env.REDIS }));
  await ms.set('transport', goodly.httpTransport({ httpHost: process.env.HTTPHOST }));
  await ms.set('mongo', collection);
  await ms.start({ brokerPath: process.env.RABBIT });

  // Bind previews.uploaded
  await ms.on('previews.uploaded', previewsUploaded);

})().catch(e => console.log(e.stack));


/**
 * Previews Uploaded
 * @param  {[type]} data         [description]
 * @param  {[type]} options.ctx  [description]
 * @param  {[type]} options.emit [description]
 * @return {[type]}              [description]
 */
async function previewsUploaded(data, { ctx, emit }) {
  let collection = await ctx.get('mongo');

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