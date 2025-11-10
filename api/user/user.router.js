import express from 'express';
import { createUser, getUserById, getUsers, removeUser, updateUser } from './user.controller.js';

const router = express.Router();

router.get('/', getUsers);

router.post('/', createUser);

router.get('/:userId', getUserById);

router.put('/:userId', updateUser);

router.delete('/:userId', removeUser);

export const userRoutes = router;
