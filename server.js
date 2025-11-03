import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { loggerService } from './services/logger.service.js';

const app = express();

//* ------------------- Config -------------------
const corsOptions = {
   origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
   credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.get('/api/bug', async (req, res) => {
   // Get all bugs
});
app.get('/api/bug/save', async (req, res) => {
   // Send bug to backend
});
app.get('/api/bug/:bugId', async (req, res) => {
   // Get specific bug
});
app.get('/api/bug/:bugId/remove', async (req, res) => {
   // Delete specific bug
});

const port = 3030;
app.listen(port, () => {
   loggerService.info(`Example app listening on port http://127.0.0.1:${port}/`);
});
