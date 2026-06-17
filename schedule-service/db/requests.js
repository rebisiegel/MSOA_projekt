import axios from 'axios';
import pool from './connection.js';

export async function addRequest(data) {
  try {
    const { username, subjectId } = data;
    const res = await pool.query('INSERT INTO request(username, subject_id) VALUES (?, ?)', [username, subjectId]);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function updateRequest(data) {
  try {
    const {  day, interval, username, subjectId } = data;
    const query =
      'UPDATE request SET day =?, `interval` = ?, status = "in progress", created_at=now() WHERE username =? AND subject_id=?';

    const values = [day, interval, username, subjectId];
    await pool.query(query, values);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getAllRequests() {
  try {
    const [rows] = await pool.query(
      'SELECT id, created_at, username, subject_id, status, day, `interval` FROM request WHERE status = "in progress" ORDER BY created_at DESC'
    );

    if (rows.length === 0) return [];

    const subjectServiceUrl = process.env.SUBJECT_SERVICE_INTERNAL_URL;
    const subjectResponse = await axios.get(`${subjectServiceUrl}/api/subjects/all`);
    const catalogSubjects = subjectResponse.data.subjects || subjectResponse.data;

    const userServiceUrl = process.env.USER_SERVICE_INTERNAL_URL;
    const userResponse = await axios.get(`${userServiceUrl}/api/users/teachers`); 
    const teachersList = userResponse.data.teachers || userResponse.data;

    return rows.map((row) => {
      const matchedSubject = catalogSubjects.find(s => s.subject_id === row.subject_id);
      const matchedTeacher = teachersList.find(t => t.username === row.username);

      return {
        id: row.id,
        date: new Date(row.created_at).toLocaleString(),
        subjectId: row.subject_id,
        status: row.status,
        day: row.day,
        interval: row.interval,
        year: matchedSubject ? matchedSubject.year : 'N/A',
        teacher: matchedTeacher ? matchedTeacher.name : row.username, 
        owner: matchedSubject ? matchedSubject.owner : row.username,
      };
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function acceptRequest(data) {
  try {
    const { username, subjectId } = data;
    const query = 'UPDATE request SET status = "accepted", created_at=now() WHERE username = ? AND subject_id = ?';
    const values = [username, subjectId];
    const res = await pool.query(query, values);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function rejectRequest(data) {
  try {
    const { username, subjectId } = data;
    const query = 'UPDATE request SET status = "rejected", created_at=now() WHERE username = ? AND subject_id = ?';
    const values = [username, subjectId];
    const res = await pool.query(query, values);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getUsersRequests(username) {
  try {
    const [rows] = await pool.query('SELECT * FROM request WHERE username = ? AND status != "accepted"', [username]);
    
    const subjectServiceUrl = process.env.SUBJECT_SERVICE_INTERNAL_URL;
    const subjectResponse = await axios.get(`${subjectServiceUrl}/api/subjects/all`).catch(() => ({ data: [] }));
    const catalogSubjects = subjectResponse.data.subjects || subjectResponse.data;

    return rows.map((row) => {
      const matchedSubject = catalogSubjects.find(s => s.subject_id === row.subject_id);
      return {
        id: row.id,
        subjectId: row.subject_id,
        status: row.status,
        day: row.day,
        interval: row.interval,
        year: matchedSubject ? matchedSubject.year : 'N/A',
        subjectName: matchedSubject ? matchedSubject.subject_name : 'N/A'
      };
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}
