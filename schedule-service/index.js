import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import adminAPI from './routes/admin.js';
import teacherAPI from './routes/teachers.js';
import studentAPI from './routes/student.js';


import { authenticateToken } from './middleware/auth.js';
import { createTables } from './db/tables.js';
import { waitForDatabase } from './db/connection.js';

const app = express();
const PORT = 5003;

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

app.use('/api/schedules', adminAPI);
app.use('/api/schedules', teacherAPI);
app.use('/api/schedules', studentAPI);


app.listen(PORT, () => {
  console.log(`A szerver fut a ${PORT} porton.`);
});
