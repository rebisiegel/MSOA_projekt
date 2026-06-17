import axios from 'axios';
import pool from './connection.js';


// Segédfüggvény: Elkéri a tantárgy katalógust a subject-service-től HTTP-n keresztül
async function fetchAllSubjectsFromCatalog() {
  try {
    const subjectServiceUrl = process.env.SUBJECT_SERVICE_INTERNAL_URL;
    const response = await axios.get(`${subjectServiceUrl}/api/subjects/all`);
    return response.data.subjects || response.data;
  } catch (error) {
    console.error('Nem sikerült elérni a subject-service-t a tantárgy törzsadatokért:', error.message);
    return [];
  }
}

// 1. Összesített órarend lekérése
export async function getAllSubject() {
  try {
    const [requests] = await pool.query('SELECT username, subject_id, day, \`interval\` FROM request WHERE status = "accepted"');
    
    const catalogSubjects = await fetchAllSubjectsFromCatalog();

    const result = [];
    for (const reqRow of requests) {
      const matchedSubject = catalogSubjects.find(s => s.subject_id === reqRow.subject_id);
      if (matchedSubject) {
        result.push({
          subjectId: matchedSubject.subject_id,
          subject: matchedSubject.subject_name,
          year: matchedSubject.year,
          curs: matchedSubject.curs,
          seminar: matchedSubject.seminar,
          lab: matchedSubject.lab,
          day: reqRow.day,
          interval: reqRow.interval,
          owner: matchedSubject.owner 
        });
      }
    }
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// 2. Egy tanár saját órarendje
export async function getTeachersSubjects(username) {
  try {
    const [requests] = await pool.query(
      'SELECT subject_id, day, \`interval\` FROM request WHERE username = ? AND status = "accepted"',
      [username]
    );
    const catalogSubjects = await fetchAllSubjectsFromCatalog();

    const result = [];
    for (const reqRow of requests) {
      const matchedSubject = catalogSubjects.find(s => s.subject_id === reqRow.subject_id && s.owner === username);
      if (matchedSubject) {
        result.push({
          subjectId: matchedSubject.subject_id,
          subject: matchedSubject.subject_name,
          year: matchedSubject.year,
          curs: matchedSubject.curs,
          seminar: matchedSubject.seminar,
          lab: matchedSubject.lab,
          day: reqRow.day,
          interval: reqRow.interval,
        });
      }
    }
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// 3. Egy diák felvett tantárgyai / órarendje
export async function getStudentsSubjects(username) {
  try {
    const [enrollments] = await pool.query('SELECT subject_id FROM enrollments WHERE username = ?', [username]);
    if (enrollments.length === 0) return [];

    const [requests] = await pool.query('SELECT subject_id, day, \`interval\` FROM request WHERE status = "accepted"');
    const catalogSubjects = await fetchAllSubjectsFromCatalog();

    const result = [];
    for (const enroll of enrollments) {
      const matchedSubject = catalogSubjects.find(s => s.subject_id === enroll.subject_id);
      const matchedRequest = requests.find(r => r.subject_id === enroll.subject_id);

      if (matchedSubject) {
        result.push({
          subjectId: matchedSubject.subject_id,
          subject: matchedSubject.subject_name,
          year: matchedSubject.year,
          curs: matchedSubject.curs,
          seminar: matchedSubject.seminar,
          lab: matchedSubject.lab,
          day: matchedRequest ? matchedRequest.day : 'null',
          interval: matchedRequest ? matchedRequest.interval : '1',
          username: username,
          teacher: matchedSubject.owner
        });
      }
    }
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}