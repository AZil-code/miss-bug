import { loggerService } from '../../services/logger.service.js';
import { bugService } from './bug.service.js';

export async function getBugs(req, res) {
   const { title, severity, description, pageIdx } = req.query;
   const filterBy = { title, severity: +severity, description };
   if (pageIdx) filterBy.pageIdx = +pageIdx;
   const sortBy = { sortBy: req.query.sortBy, sortDir: req.query.sortDir || 1 };
   res.send(await bugService.query(filterBy, sortBy));
}

export async function createBug(req, res) {
   const { title, severity, description } = req.body;
   console.log(req.body);
   res.send(
      await bugService.save({
         title: title,
         severity: severity,
         description,
         createadAt: Date.now(),
      })
   );
}

export async function updateBug(req, res) {
   const { title, severity, description } = req.body;
   const { bugId } = req.params;
   res.send(
      await bugService.save({
         _id: bugId,
         title: title,
         severity: severity,
         description,
      })
   );
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
   await bugService.remove(req.params.bugId);
}
