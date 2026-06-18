import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import subjectAPI from './routes/subject.js';
import syllabusAPI from './routes/syllabus.js';
import fileAPI from './routes/files.js';

import { authenticateToken } from './middleware/auth.js';
import { createTables } from './db/tables.js';
import { waitForDatabase } from './db/connection.js';

const app = express();
const PORT = 5002;

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('common'));
app.use(cookieParser());

waitForDatabase();
createTables();

app.get('/', (req, res) => {
    res.status(200).send('OK');
});

app.use(authenticateToken);

app.use('/api/subjects', subjectAPI);
app.use('/api/subjects', fileAPI);
app.use('/api/subjects', syllabusAPI);


app.listen(PORT, () => {
  console.log(`A szerver fut a ${PORT} porton.`);
});
