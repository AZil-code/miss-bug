import { loggerService } from '../../services/logger.service.js';
import { userService } from './user.service.js';

export async function getUsers(req, res) {
   const { fullname, score, username, pageIdx } = req.query;
   const filterBy = { fullname, score: +score, username };
   if (pageIdx) filterBy.pageIdx = +pageIdx;
   const sortBy = { sortBy: req.query.sortBy, sortDir: req.query.sortDir || 1 };
   res.send(await userService.query(filterBy, sortBy));
}

export async function createUser(req, res) {
   const { fullname, score, username, password } = req.body;
   res.send(
      await userService.save({
         fullname: fullname,
         score: score,
         username,
         password,
      })
   );
}

export async function updateUser(req, res) {
   const { fullname, score, username, password } = req.body;
   const { userId } = req.params;
   res.send(
      await userService.save({
         _id: userId,
         fullname: fullname,
         score: score,
         username,
         password,
      })
   );
}

export async function getUserById(req, res) {
   const { userId } = req.params;
   try {
      res.send(await userService.getById(userId));
   } catch (err) {
      loggerService.error('Cannot get user', err);
      res.status(404).send('Cannot get user');
   }
}

export async function removeUser(req, res) {
   await userService.remove(req.params.userId);
}
