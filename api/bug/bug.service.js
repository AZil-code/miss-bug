import { loggerService } from '../../services/logger.service.js';
import { makeId, readJsonFile, writeJsonFile } from '../../services/utils.js';

export const bugService = {
   query,
   getById,
   remove,
   save,
};

const bugs = readJsonFile('./data/bugs.json');
const PAGE_SIZE = 4;

async function query(filterBy = {}, sortBy = {}) {
   let bugsToDisplay = bugs;
   try {
      if (filterBy.creatorId) {
         bugsToDisplay = bugsToDisplay.filter((bug) => bug.creator._id === filterBy.creatorId);
      }
      if (filterBy.title) {
         const regExp = new RegExp(filterBy.title, 'i');
         bugsToDisplay = bugsToDisplay.filter((bug) => regExp.test(bug.title));
      }
      if (filterBy.description) {
         const regExp = new RegExp(filterBy.description, 'i');
         bugsToDisplay = bugsToDisplay.filter((bug) => regExp.test(bug.description));
      }
      if (filterBy.severity != null && filterBy.severity >= 0) {
         bugsToDisplay = bugsToDisplay.filter((bug) => bug.severity >= filterBy.severity);
      }

      if (sortBy.sortBy && bugsToDisplay.length > 1) {
         const { sortBy: sortField, sortDir } = sortBy;
         switch (typeof bugsToDisplay[0][sortField]) {
            case 'string':
               bugsToDisplay.sort((a, b) => sortDir * a[sortField].localeCompare(b[sortField]));
               break;
            case 'number':
               bugsToDisplay.sort((a, b) => sortDir * (a[sortField] - b[sortField]));
               break;
         }
      }

      if ('pageIdx' in filterBy) {
         const startIdx = filterBy.pageIdx * PAGE_SIZE;
         bugsToDisplay = bugsToDisplay.slice(startIdx, startIdx + PAGE_SIZE);
      }

      return bugsToDisplay;
   } catch (err) {
      loggerService.error(err);
      throw err;
   }
}

async function getById(bugId) {
   try {
      const bug = bugs.find((bug) => bug._id === bugId);
      if (!bug) throw new Error('Cannot find bug');
      return bug;
   } catch (err) {
      loggerService.error(err);
      throw err;
   }
}

async function remove(bugId, loggedinUser) {
   try {
      const bugIdx = bugs.findIndex((bug) => bug._id === bugId);
      if (bugIdx < 0) throw new Error('Cannot find bug');
      if (!loggedinUser.isAdmin && loggedinUser._id !== bugs[bugIdx].creator._id) throw 'User does not own bug';
      bugs.splice(bugIdx, 1);
      await _saveBugsToFile();
      loggerService.debug('Delete bug success! ', bugId);
      return;
   } catch (err) {
      throw err;
   }
}

async function save(bugToSave, loggedinUser) {
   console.log(bugToSave);
   try {
      let logTxt;
      if (bugToSave._id) {
         const bugIdx = bugs.findIndex((bug) => bug._id === bugToSave._id);
         if (bugIdx < 0) throw new Error('Cannot find bug');

         if (!loggedinUser.isAdmin && loggedinUser._id !== bugToSave.creator._id) throw 'User does not own bug';

         const { title, description, severity } = bugToSave;
         bugs[bugIdx] = { ...bugs[bugIdx], title, description, severity };
         logTxt = 'updated';
      } else {
         bugToSave._id = makeId();
         bugs.push(bugToSave);
         logTxt = 'created';
      }
      await _saveBugsToFile();
      loggerService.debug(`Bug ${logTxt} - `, bugToSave);
      return bugToSave;
   } catch (err) {
      loggerService.error(err);
      throw err;
   }
}

function _saveBugsToFile() {
   return writeJsonFile('./data/bugs.json', bugs);
}
