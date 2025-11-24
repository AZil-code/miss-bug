import { ObjectId } from 'mongodb';
import { dbService } from '../../services/db.service.js';
import { loggerService } from '../../services/logger.service.js';
import { makeId, readJsonFile, writeJsonFile } from '../../services/utils.js';

export const userService = {
   query,
   getByUsername,
   remove,
   save,
};

const users = readJsonFile('./data/users.json');
const PAGE_SIZE = 4;
const DB_NAME = 'user';

async function query(filterBy = {}, sortBy = {}) {
   const where = {};
   try {
      if (filterBy.fullname) {
         const regExp = new RegExp(filterBy.fullname, 'i');
         where.fullname = { $regex: filterBy.fullname };
      }
      if (filterBy.username) {
         const regExp = new RegExp(filterBy.username, 'i');
         where.username = { $regex: filterBy.username };
      }
      const collection = await dbService.getCollection(DB_NAME);
      const { sortBy: sortField, sortDir } = sortBy;
      return await collection
         .find(where)
         .sort({ [sortField]: sortDir })
         .skip(PAGE_SIZE * filterBy.pageIdx)
         .toArray();

      return usersToDisplay;
   } catch (err) {
      loggerService.error(err);
      throw err;
   }
}

async function getByUsername(username) {
   try {
      const collection = await dbService.getCollection(DB_NAME);
      const user = await collection.findOne({ username: username });
      if (!user) throw new Error('Cannot find user');
      return { _id: user._id, username: user.username, fullname: user.fullname, isAdmin: user.isAdmin };
   } catch (err) {
      loggerService.error(err);
      throw err;
   }
}

async function remove(userId, loggedinUser) {
   try {
      const collection = await dbService.getCollection(DB_NAME);
      if (!loggedinUser.isAdmin) throw new Error('Cannot remove user');
      await collection.deleteOne({ _id: ObjectId.createFromHexString(userId) });
      loggerService.debug('Delete user success! ', userId);
   } catch (err) {
      loggerService.error(err);
      throw err;
   }
}

async function save(userToSave, loggedinUser) {
   let newUser;
   try {
      const collection = await dbService.getCollection(DB_NAME);
      let logTxt;
      if (userToSave._id) {
         if (!loggedinUser.isAdmin && userToSave._id !== loggedinUser._id) throw new Error('Cannot save user');
         newUser = await collection.updateOne({ _id: ObjectId.cacheHexString(userToSave._id) }, { $set: userToSave });
         logTxt = 'updated';
      } else {
         newUser = await collection.insertOne(userToSave);
         logTxt = 'created';
      }
      loggerService.debug(`User ${logTxt} - `, userToSave);
      return newUser;
   } catch (err) {
      loggerService.error('Failed to save user: ', err);
      throw err;
   }
}

function _saveUsersToFile() {
   return writeJsonFile('./data/users.json', users);
}
