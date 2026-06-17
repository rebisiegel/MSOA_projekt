import pool from './connection.js';

export async function getAllUsers() {
  try {
    const [result] = await pool.query('SELECT * FROM users');
    return result.map((row) => ({
      username: row.username,
      password: row.password,
    }));
  } catch (error) {
    console.error('Hiba történt a felahasznalok lekerdezese kozben', error);
    throw error;
  }
}

export async function getStudents() {
  try {
    const [result] = await pool.query('SELECT * FROM users WHERE role = "student"');
    return result.map((row) => ({
      username: row.username,
      password: row.password,
    }));
  } catch (error) {
    console.error('Hiba történt a diákok lekerdezese kozben', error);
    throw error;
  }
}


export async function findUserByName(userName) {
  try {
    if (!userName) {
      throw new Error('Nincs input');
    }

    const [result] = await pool.query('SELECT * FROM users WHERE username = ?', [userName]);
    if (result.length === 0) {
      throw new Error('A felhasználó nem található');
    }

    const { username, password, name, role } = result[0];
    return { username, password, name, role };
  } catch (error) {
    console.error('Hiba a felhasznalo kereseseben:', error.message);
    throw new Error('Hiba a felhasznalo kereseseben');
  }
}

export async function getTeachers() {
  try {
    const [result] = await pool.query('SELECT * FROM users WHERE role = ?', ['teacher']);
    return result.map((row) => ({
      username: row.username,
      name: row.name,
    }));
  } catch (error) {
    console.error('Hiba');
    throw new Error('Hiba a tanarok lekerdezese során');
  }
}

export async function updateUsersTheme(username, theme) {
  try {
    if (!username || !theme) {
      throw new Error('Nincs input');
    }
    const updateQuery = await pool.query('UPDATE users SET theme = ? WHERE username = ?', [theme, username]);
    return updateQuery;
  } catch (error) {
    console.error('Hiba a tema frissiteseben:', error.message);
    throw new Error('Hiba a tema frissiteseben');
  }
}

export async function getUserTheme(username) {
  try {
    if (!username) {
      throw new Error('Nincs input');
    }
    const [result] = await pool.query('SELECT theme FROM users WHERE username = ?', [username]);
    if (result.length === 0) {
      throw new Error('A felhasználó nem található');
    }
    return result[0].theme;
  } catch (error) {
    console.error('Hiba a tema lekerdezese soran:', error.message);
    throw new Error('Hiba a tema lekerdezese soran');
  }
}
