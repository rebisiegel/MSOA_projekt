import pool from './connection.js';

export async function saveFile(subjectId, fileName) {
  try {
    await pool.query('INSERT INTO files (subject_id, file_name) VALUES (?, ?)', [subjectId, fileName]);
  } catch (error) {
    console.error('Hiba történt a fájl nevének mentése közben:', error);
    throw error;
  }
}

export async function getFilesBySubjectId(subjectId) {
  try {
    const [rows] = await pool.query('SELECT * FROM files WHERE subject_id = ?', [subjectId]);
    return rows;
  } catch (error) {
    console.error('Error fetching files by subjectId:', error);
    throw error;
  }
}

export async function getFileById(fileId) {
  try {
    const [rows] = await pool.query('SELECT * FROM files WHERE id = ?', [fileId]);
    return rows[0];
  } catch (error) {
    console.error('Hiba a file kereseseben:'.error);
    throw error;
  }
}

export async function deleteFilesById(id) {
  try {
    await pool.query('DELETE FROM files WHERE id = ?', [id]);
  } catch (error) {
    console.error('Hiba a file torlese soran', error);
    throw error;
  }
}
