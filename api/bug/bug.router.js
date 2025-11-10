import express from 'express';
import { createBug, getBugById, getBugs, removeBug, updateBug } from './bug.controller.js';

const router = express.Router();

router.get('/', getBugs);

router.post('/', createBug);

router.get('/:bugId', getBugById);

router.put('/:bugId', updateBug);

router.delete('/:bugId', removeBug);

export const bugRoutes = router;
