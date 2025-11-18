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

async function query(filterBy = {}, sortBy = {}) {
   let usersToDisplay = users;
   try {
      if (filterBy.fullname) {
         const regExp = new RegExp(filterBy.fullname, 'i');
         usersToDisplay = usersToDisplay.filter((user) => regExp.test(user.fullname));
      }
      if (filterBy.username) {
         const regExp = new RegExp(filterBy.username, 'i');
         usersToDisplay = usersToDisplay.filter((user) => regExp.test(user.username));
      }
      if (filterBy.score != null && filterBy.score >= 0) {
         usersToDisplay = usersToDisplay.filter((user) => user.score >= filterBy.score);
      }

      if (sortBy.sortBy && usersToDisplay.length > 1) {
         const { sortBy: sortField, sortDir } = sortBy;
         switch (typeof usersToDisplay[0][sortField]) {
            case 'string':
               usersToDisplay.sort((a, b) => sortDir * a[sortField].localeCompare(b[sortField]));
               break;
            case 'number':
               usersToDisplay.sort((a, b) => sortDir * (a[sortField] - b[sortField]));
               break;
         }
      }

      if ('pageIdx' in filterBy) {
         const startIdx = filterBy.pageIdx * PAGE_SIZE;
         usersToDisplay = usersToDisplay.slice(startIdx, startIdx + PAGE_SIZE);
      }

      return usersToDisplay;
   } catch (err) {
      loggerService.error(err);
      throw err;
   }
}

async function getByUsername(username) {
   try {
      const user = users.find((user) => user.username === username);
      if (!user) throw new Error('Cannot find user');
      return { _id: user._id, username: user.username, fullname: user.fullname, isAdmin: user.isAdmin };
   } catch (err) {
      loggerService.error(err);
   }
}

async function remove(userId) {
   try {
      const userIdx = users.findIndex((user) => user._id === userId);
      if (userIdx < 0) throw new Error('Cannot find user');
      users.splice(userIdx, 1);
      await _saveUsersToFile();
      loggerService.debug('Delete user success! ', userId);
   } catch (err) {
      loggerService.error(err);
      throw err;
   }
}

async function save(userToSave) {
   try {
      let logTxt;
      if (userToSave._id) {
         const userIdx = users.findIndex((user) => user._id === userToSave._id);
         if (userIdx < 0) throw new Error('Cannot find user');
         users[userIdx] = userToSave;
         logTxt = 'updated';
      } else {
         userToSave._id = makeId();
         users.push(userToSave);
         logTxt = 'created';
      }
      await _saveUsersToFile();
      loggerService.debug(`User ${logTxt} - `, userToSave);
      return userToSave;
   } catch (err) {
      loggerService.error('Failed to save user: ', err);
      throw err;
   }
}

function _saveUsersToFile() {
   return writeJsonFile('./data/users.json', users);
}
