import { MongoClient } from 'mongodb';
import { loggerService } from './logger.service.js';

const DB_NAME = 'miss-bug';
const DB_URL = 'mongodb://localhost:27017';

export const dbService = {
   getCollection,
};

let connection = null;

async function getCollection(collectionName) {
   const connection = await _connect();
   return connection.collection(collectionName);
}

async function _connect() {
   if (connection) return connection;
   try {
      const client = await MongoClient.connect(DB_URL);
      const db = client.db(DB_NAME);
      connection = db;
      return db;
   } catch (err) {
      loggerService.error('Cannot connect to database', err);
      throw err;
   }
}
