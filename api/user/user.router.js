import express from 'express';
import { createUser, getUser, getUsers, removeUser, updateUser } from './user.controller.js';
import { requireAuth } from '../../middlewares/require-auth.middleware.js';

const router = express.Router();

router.get('/', getUsers);

router.post('/', createUser);

router.get('/:username', getUser);

router.put('/:userId', requireAuth, updateUser);

router.delete('/:userId', requireAuth, removeUser);

export const userRoutes = router;
