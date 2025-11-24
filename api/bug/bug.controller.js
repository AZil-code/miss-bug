import { loggerService } from '../../services/logger.service.js';
import { bugService } from './bug.service.js';

export async function getBugs(req, res) {
   const { title, severity, description, pageIdx, creatorId } = req.query;
   const filterBy = { title, severity: +severity, description, creatorId };
   if (pageIdx) filterBy.pageIdx = +pageIdx;
   const sortBy = { sortBy: req.query.sortBy, sortDir: req.query.sortDir || 1 };
   res.send(await bugService.query(filterBy, sortBy));
}

export async function createBug(req, res) {
   const { title, severity, description } = req.body;
   const loggedinUser = req.loggedinUser;

   res.send(
      await bugService.save({
         title: title,
         severity: severity,
         description,
         creator: {
            _id: loggedinUser._id,
            fullname: loggedinUser.fullname,
         },
         createadAt: Date.now(),
      })
   );
}

export async function updateBug(req, res) {
   const { title, severity, description, creator } = req.body;
   const { bugId } = req.params;
   const loggedinUser = req.loggedinUser;
   try {
      const bug = await bugService.save(
         {
            _id: bugId,
            title: title,
            severity: severity,
            description,
            creator,
         },
         loggedinUser
      );
      res.send(bug);
   } catch (err) {
      res.status(404).send('Could not update bug!');
   }
}

export async function getBugById(req, res) {
   const { bugId } = req.params;
   try {
      res.send(await bugService.getById(bugId));
   } catch (err) {
      loggerService.error('Cannot get bug', err);
      res.status(404).send('Cannot get bug');
   }
}

export async function removeBug(req, res) {
   try {
      await bugService.remove(req.params.bugId, req.loggedinUser);
      res.send(200);
   } catch (err) {
      loggerService.error('Cannot delete bug', err);
      res.status(400).send('Cannot delete bug');
   }
}
