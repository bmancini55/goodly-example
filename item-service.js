import goodly from 'goodly';
import mongo from 'mongo-helper';
import debugModule from 'debug';

const debug = debugModule('items-service');

// TODO - find a better way to allow await statements and error trapping
//        possible solution would be implementing setup as a callback function
//        that exports for testability?
(async () => {

  const db = await mongo.connect({ url: process.env.MONGO });
  const collection = db.collection('items');
  debug('connected to %s', process.env.MONGO);

  let ms = goodly({ name: 'item' });
  await ms.set('cache', goodly.redisCache({ redisUrl: process.env.REDIS }));
  await ms.set('transport', goodly.httpTransport({ httpHost: process.env.HTTPHOST }));
  await ms.set('mongo', collection);
  await ms.start({ brokerPath: process.env.RABBIT });

  await ms.on('previews.available', previewsAvailable)

})().catch(e => console.log(e.stack));


/**
 * Listens for the previews available event
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


