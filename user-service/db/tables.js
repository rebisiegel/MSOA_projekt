import pool from './connection.js';

export async function createTables() {
  try {
   
    await pool.query(`CREATE TABLE IF NOT EXISTS roles (
      id serial primary key,
      role_name varchar(50) unique not null,
      CONSTRAINT CK_RoleName CHECK (role_name IN ('admin','teacher','student'))
      );`);

      await pool.query(`
      INSERT INTO roles (role_name) VALUES ('admin'), ('teacher'), ('student')
      ON DUPLICATE KEY UPDATE role_name=role_name;
    `);

    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id serial primary key,
      username varchar(255) unique not null,
      password varchar(255) not null,
      name varchar(255) not null,
      role varchar(50) not null,
      FOREIGN KEY (role) REFERENCES roles(role_name),
      INDEX username_index (username));
    `);

   
    console.log('User-service táblák sikeresen létrehozva.');
  } catch (err) {
    console.error(`Hiba a User-service táblák létrehozásakor: ${err}`);
    throw err;
  }
}
