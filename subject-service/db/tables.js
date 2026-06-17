import pool from './connection.js';

export async function createTables() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS subjects (
      id serial primary key,
      subject_id varchar(50) unique not null,
      subject_name varchar(50) not null,
      year varchar(50) not null,
      curs int not null,
      seminar int not null,
      lab int not null,
      owner varchar(50) not null,
      syllabus text,
     INDEX subject_id_index (subject_id));
    `);

    await pool.query(`CREATE TABLE IF NOT EXISTS files (
      id serial primary key,
      subject_id varchar(50) not null,
      file_name varchar(255) not null,
      FOREIGN KEY (subject_id) REFERENCES subjects(subject_id));
    `);

   
    console.log('Subject-service táblák sikeresen létrehozva');
  } catch (err) {
    console.error(`Hiba a Subject-service táblák létrehozásakor: ${err}`);
    throw err;
  }
}
