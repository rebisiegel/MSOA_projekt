import pool from './connection.js';

function validateData(data) {
  const { curs, seminar, lab } = data;
  if (Number.isNaN(curs) || curs < 0 || curs > 14) {
    throw new Error('Invalid curs value.');
  }

  if (Number.isNaN(seminar) || seminar < 0 || seminar > 14) {
    throw new Error('Invalid seminar value.');
  }

  if (Number.isNaN(lab) || lab < 0 || lab > 14) {
    throw new Error('Invalid lab value.');
  }
}

export async function addSubject(data) {
  try {
    validateData(data);
    const res = await pool.query(
      'INSERT INTO subjects(subject_id, subject_name, year, curs, seminar, lab, owner) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.subjectId, data.subject, data.year, data.curs, data.seminar, data.lab, data.owner],
    );
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getAllSubject() {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM subjects`,
    );
    return rows;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getSubjectBySubjectId(subjectId) {
  try {
    const [rows] = await pool.query(
      `SELECT s.subject_id, s.subject_name, s.year, s.curs, s.seminar, s.lab, s.syllabus,s.owner FROM subjects s WHERE subject_id= ?`,
      [subjectId],
    );
    const subject = rows[0];

    if(subject){
    const [fileRows] = await pool.query('SELECT * FROM files WHERE subject_id = ?', [subjectId]);
    if (fileRows.length > 0) {
      subject.fileName = fileRows[0].file_name;
    }
  }
    return subject;
  } catch (err) {
    console.error('Error querying subject by subjectId:', err);
    throw err;
  }
}

export async function getOwner(subjectId) {
  try {
    const [rows] = await pool.query('SELECT owner FROM subjects WHERE subject_id = ?', [subjectId]);
    return rows[0].owner;
  } catch (error) {
    console.error('Hiba a tulaj kereseseben', error);
    throw error;
  }
}


