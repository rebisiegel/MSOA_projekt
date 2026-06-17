import pool from './connection.js';
import { getTeachersSubjects } from './subjects.js';
import axios from 'axios';

//  Tanár órarendi ütközésének ellenőrzése 
export async function checkTeacherSchedule(username, day, interval, subjectId) {
  try {
    const teacherSubjects = await getTeachersSubjects(username);
    const conflict = teacherSubjects.some(
      (subject) => subject.day === day && subject.interval === interval && subject.subjectId !== subjectId,
    );
    return conflict;
  } catch (err) {
    console.log('Error checking teachers schedule:', err);
    throw err;
  }
}

// Évfolyam/osztály ütközésének ellenőrzése JOIN nélkül
export async function checkYearSchedule(year, day, interval, subjectId) {
  try {
    const [acceptedRequests] = await pool.query(
      'SELECT subject_id FROM request WHERE day = ? AND `interval` = ? AND subject_id != ? AND status = "accepted"',
      [day, interval, subjectId]
    );

    if (acceptedRequests.length === 0) return false;

    const subjectServiceUrl = process.env.SUBJECT_SERVICE_INTERNAL_URL;
    const response = await axios.get(`${subjectServiceUrl}/api/subjects/all`);
    const catalogSubjects = response.data.subjects || response.data;

    const hasConflict = acceptedRequests.some(reqRow => {
      const subjectDetail = catalogSubjects.find(s => s.subject_id === reqRow.subject_id);
      return subjectDetail && subjectDetail.year === year;
    });

    return hasConflict;
  } catch (err) {
    console.log('Error checking year schedule:', err);
    throw err;
  }
}