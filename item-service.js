import goodly from 'goodly';
import mongo from 'mongo-helper';
import debugModule from 'debug';
import config from './config.json';

const debug = debugModule('item');

// TODO - find a better way to allow await statements and error trapping
//        possible solution would be implementing setup as a callback function
//        that exports for testability?
(async () => {

  const db = await mongo.connect({ url: config.mongo.url });
  const collection = db.collection('items');
  debug('connected to %s', config.mongo.url);

  let ms = goodly({ name: 'item' });
  await ms.set('cache', goodly.redisCache({ redisUrl: config.redis.url }));
  await ms.set('transport', goodly.httpTransport({ httpHost: config.httpTransport.host }));
  await ms.set('mongo', collection);
  await ms.start({ brokerPath: config.rabbit.brokerPath });

  await ms.on('previews.available', previewsAvailable)

})().catch(e => console.log(e.stack));


/**
 * EVENT previews.avaialble
 * EMIT  item.available
 * From a previews record it will upsert an item in the item database
 * @param  {[type]} data         [description]
 * @param  {[type]} options.ctx  [description]
 * @param  {[type]} options.emit [description]
 * @return {[type]}              [description]
 */
async function previewsAvailable(data, { ctx, emit }) {
  let collection = await ctx.get('mongo');

  // persist the record
  let filter = { _id: data.stock_no };
  let update = {
    $addToSet: {
      previews: data.previews_no
    },
    $setOnInsert: {
      title: data.title,
      msrp: data.msrp,
      isbn: data.isbn,
      publisher: data.publisher,
      author: data.author,
      artist: data.artist,
      cover_artist: data.cover_artist
    }
  }
  let options = { upsert: true, returnOriginal: false };
  let result = await collection.findOneAndUpdateAsync(filter, update, options);

  // emit preview record
  if(result.ok) {
    emit('item.available', result.value);
  }
}


