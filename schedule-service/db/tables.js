import pool from './connection.js';

export async function createTables() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS request (
      id serial primary key,
      username varchar(255) not null,
      subject_id varchar(50) not null,
      status varchar(50) not null default 'pending',
      created_at timestamp default now(),
      day varchar(50) not null default 'null',
      \`interval\` varchar(50) not null default '1',
      CONSTRAINT unique_request UNIQUE (username, subject_id, day, \`interval\`)
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS enrollments (
      id serial primary key,
      username varchar(255) not null,
      subject_id varchar(50) not null
    );`);

    console.log('Schedule-service táblák sikeresen létrehozva.');
  } catch (err) {
    console.error('Hiba a Schedule táblák létrehozásakor:', err);
  }
}