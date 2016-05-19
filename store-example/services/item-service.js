import goodly from 'goodly';
import mongo from 'mongo-helper';
import debugModule from 'debug';
import config from '../config.json';

const debug = debugModule('item');

// TODO - find a better way to allow await statements and error trapping
//        possible solution would be implementing setup as a callback function
//        that exports for testability?
(async () => {

  const db = await mongo.connect({ url: config.mongo.url });
  const itemsCollection = db.collection('items');
  const itemPeopleCollection = db.collection('itempeople');
  debug('connected to %s', config.mongo.url);

  let ms = goodly({ name: 'item' });
  await ms.set('cache', goodly.redisCache({ redisUrl: config.redis.url }));
  await ms.set('transport', goodly.httpTransport({ httpHost: config.httpTransport.host }));
  await ms.start({ brokerPath: config.rabbit.brokerPath });

  await ms.set('items-collection', itemsCollection);
  await ms.set('itempeople-collection', itemPeopleCollection);

  await ms.on('previews.available', previewsAvailable);
  await ms.on('person.available', personAvailable);

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
async function previewsAvailable({ service, emit, data }) {
  let collection = await service.get('items-collection');

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
  };
  let options = { upsert: true, returnOriginal: false };
  let result = await collection.findOneAndUpdateAsync(filter, update, options);

  // emit preview record
  if(result.ok) {
    emit('item.available', result.value);
  }
}

/**
 * Handles a person being available and duplicates the person
 * record for use by the
 * @param  {[type]} options.data [description]
 * @return {[type]}              [description]
 */
async function personAvailable({ service, data }) {
  let collection = await service.get('itempeople-collection');

  let filter = { _id: data._id };
  let update = data;
  let options = { upsert: true, returnOriginal: false };

  // update local cache of users
  await collection.findOneAndUpdateAsync(filter, update, options);

  // insert record
}

