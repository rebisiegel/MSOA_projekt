import pool from './connection.js';

export async function saveSyllabus(subjectId, syllabus) {
  try {
    console.log(subjectId, syllabus);
    const res = await pool.query('UPDATE subjects SET syllabus = ? WHERE subject_id = ?', [syllabus, subjectId]);
    return res;
  } catch (error) {
    console.error('Error saving syllabus:', error);
    throw error;
  }
}
