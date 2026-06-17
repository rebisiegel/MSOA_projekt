import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from './connection.js';

export async function hashPassword(username, password, name, role) {
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password, name, role) VALUES (?,?,?,?)', [
      username,
      hash,
      name,
      role,
    ]);
  } catch (error) {
    console.error('Hiba a felhasznalok beszurasaban:', error);
  }
}



