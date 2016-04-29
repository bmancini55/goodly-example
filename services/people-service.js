import goodly from 'goodly';
import mongo from 'mongo-helper';
import debugModule from 'debug';
import config from '../config.json';

const debug = debugModule('people');

// TODO - find a better way to allow await statements and error trapping
//        possible solution would be implementing setup as a callback function
//        that exports for testability?
(async () => {

  const db = await mongo.connect({ url: config.mongo.url });
  const collection = db.collection('people');
  debug('connected to %s', config.mongo.url);

  let ms = goodly({ name: 'people' });
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

  let { author, cover_artist, artist } = data;

  // author
  await processPerson({ collection, emit, name: author, isAuthor: true});

  // cover artist
  await processPerson({ collection, emit, name: cover_artist, isCoverArtist: true });

  // artist
  await processPerson({ collection, emit, name: artist, isArtist: true });
}


//////////////////////

async function normalizedName(name) {
  if(name.indexOf(',') > 0)
    return name;
  else {
    let parts = name.split(' ');
    let last = parts.splice(parts.length - 1);
      return last + ', ' + parts.join(' ');
  }
}


async function processPerson({ collection, emit, name, isAuthor, isCoverArtist, isArtist }) {
  let normed = await normalizedName(name);
  let person;

  if(isAuthor)
    person = await upsertAuthor({ collection, normed, rawName: name, isAuthor });

  else if (isCoverArtist)
    person = await upsertCoverArtist({ collection, normed, rawName: name, isCoverArtist });

  else if (isArtist)
    person = await upsertArtist({ collection, normed, rawName: name, isArtist });

  if(person)
    emit('person.available', person);
}

async function upsertAuthor({ collection, emit, normed, rawName, isAuthor }) {
  let filter = { name: normed };
  let update = {
    $setOnInsert: {
      name: normed,
      isCoverArtist: false,
      isArtist: false,
      created: new Date()
    },
    $set: {
      isAuthor: isAuthor,
      updated: new Date()
    },
    $addToSet: {
      rawNames: rawName
    }
  };
  let options = { upsert: true, returnOriginal: false };
  let result = await collection.findOneAndUpdateAsync(filter, update, options);
  if(result.ok)
    return result.value;
}

async function upsertCoverArtist({ collection, emit, normed, rawName, isCoverArtist }) {
  let filter = { name: normed };
  let update = {
    $setOnInsert: {
      name: normed,
      isAuthor: false,
      isArtist: false,
      created: new Date()
    },
    $set: {
      isCoverArtist: isCoverArtist,
      updated: new Date()
    },
    $addToSet: {
      rawNames: rawName
    }
  }
  let options = { upsert: true, returnOriginal: false };
  let result = await collection.findOneAndUpdateAsync(filter, update, options);
  if(result.ok)
    return result.value;
}

async function upsertArtist({ collection, emit, normed, rawName, isArtist }) {
  let filter = { name: normed };
  let update = {
    $setOnInsert: {
      name: normed,
      isAuthor: false,
      isCoverArtist: false,
      created: new Date()
    },
    $set: {
      isArtist: isArtist,
      updated: new Date()
    },
    $addToSet: {
      rawNames: rawName
    }
  }
  let options = { upsert: true, returnOriginal: false };
  let result = await collection.findOneAndUpdateAsync(filter, update, options);
  if(result.ok)
    return result.value;
}
