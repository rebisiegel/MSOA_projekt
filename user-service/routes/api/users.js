import pool from '../../db/connection.js';
import express from 'express';
import { getTeachers, getUserTheme, updateUsersTheme } from '../../db/users.js';
import { requireAuth } from '../../middleware/auth.js';
import { hashPassword } from '../../db/hashPwd.js'

const router = express.Router();


router.get('/theme', requireAuth, async (req, res) => {
  try {
    const { username } = req.user;
    const userTheme = await getUserTheme(username);
    return res.json({ theme: userTheme });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/theme', requireAuth, async (req, res) => {
  const { theme } = req.body;
  const { username } = req.user;

  const updatedUser = await updateUsersTheme(username, theme);
  return res.json({ theme: updatedUser.theme });
});

router.get('/teachers', async (req,res) => {
  try{
      const teachers = await getTeachers();
      return res.status(200).json([]);
  }catch(err){
    console.error('Hiba a tanárok lekérésekor:', err);
    return res.status(500).json({ error: 'Szerver hiba' });
  }
})

router.post('/register', async (req, res) => {
  const { username, password, name, role } = req.body;

  if (!username || !password || !name || !role) {
    return res.status(400).json({ message: 'Minden mező kitöltése kötelező!' });
  }

  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Ez a felhasználónév már foglalt!' });
    }

   const result = await hashPassword(username,password,name,role);

    return res.status(201).json({ 
      message: 'Sikeres regisztráció!',
      user: { username, name, role }
    });

  } catch (error) {
    console.error('Hiba a regisztráció során:', error);
    return res.status(500).json({ message: 'Szerverhiba történt a mentés során.' });
  }
});

export default router;
