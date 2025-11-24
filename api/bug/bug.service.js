import { ObjectId } from 'mongodb';
import { dbService } from '../../services/db.service.js';
import { loggerService } from '../../services/logger.service.js';
import { makeId, readJsonFile, writeJsonFile } from '../../services/utils.js';

export const bugService = {
   query,
   getById,
   remove,
   save,
};

const DB_NAME = 'bug';
const bugs = readJsonFile('./data/bugs.json');
const PAGE_SIZE = 4;

async function query(filterBy = {}, sortBy = {}) {
   const where = {};
   if (filterBy.creatorId) {
      where['creator._id'] = filterBy.creatorId;
   }
   if (filterBy.title) {
      const regExp = new RegExp(filterBy.title, 'i');
      where.title = { $regex: filterBy.title };
   }

   if (filterBy.severity != null && filterBy.severity >= 0) {
      where.severity = { $gte: filterBy.severity };
   }

   const { sortBy: sortField, sortDir } = sortBy;

   try {
      const collection = await dbService.getCollection(DB_NAME);
      const bugs = await collection
         .find(where)
         .sort({ [sortField]: sortDir })
         // .limit(PAGE_SIZE)
         .skip(PAGE_SIZE * filterBy.pageIdx)
         .toArray();
      return bugs;
   } catch (err) {
      loggerService.error(err);
      throw err;
   }
}

async function getById(bugId) {
   console.log(bugId);
   try {
      const collection = await dbService.getCollection(DB_NAME);
      const bug = await collection.findOne({ _id: ObjectId.createFromHexString(bugId) });
      if (!bug) throw new Error('Cannot find bug');
      return bug;
   } catch (err) {
      loggerService.error(err);
      throw err;
   }
}

async function remove(bugId, loggedinUser) {
   try {
      const collection = await dbService.getCollection(DB_NAME);
      const bugIdObj = { _id: ObjectId.createFromHexString(bugId) };
      const bug = await collection.findOne(bugIdObj);
      if (!bug) throw new Error('Cannot find bug');
      if (!loggedinUser.isAdmin && loggedinUser._id !== bug.creator._id) throw new Error('User does not own bug');
      const res = await collection.deleteOne(bugIdObj);
      loggerService.debug('Delete bug success! ', bugId);
      return res;
   } catch (err) {
      throw err;
   }
}

async function save(bugToSave, loggedinUser) {
   console.log(loggedinUser);
   console.log(bugToSave);
   let newBug;
   try {
      const collection = await dbService.getCollection(DB_NAME);
      let logTxt;
      if (bugToSave._id) {
         if (!loggedinUser.isAdmin && loggedinUser._id !== bugToSave.creator._id) throw 'User does not own bug';
         const { title, description, severity } = bugToSave;
         newBug = await collection.updateOne(
            { _id: ObjectId.createFromHexString(bugToSave._id) },
            { $set: { title, description, severity } }
         );
         logTxt = 'updated';
      } else {
         newBug = await collection.insertOne(bugToSave);
         logTxt = 'created';
      }
      loggerService.debug(`Bug ${logTxt} - `, bugToSave);
      return newBug;
   } catch (err) {
      loggerService.error(err);
      throw err;
   }
}

function _saveBugsToFile() {
   return writeJsonFile('./data/bugs.json', bugs);
}
