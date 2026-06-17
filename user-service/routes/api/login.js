import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByName } from '../../db/users.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

const secret = 'secretkey';

// bejelentkezes, az szerint hogy kinek mi a szerepe mas-mas oldalra vezet
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await findUserByName(username);

    if (!user) {
      return res.status(404).json({ error: 'Nem letezo felhasznalo' });
    }
    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      return res.status(401).json({ error: 'Nem helyes a jelszo' });
    }

    const token = jwt.sign({ username: user.username, name: user.name, role: user.role }, secret);
    res.cookie('auth', token, { httpOnly: true, sameSite: 'lax', secure: false });

    return res.status(200).json({
      message: 'Sikeres bejelentkezés',
      user: { username: user.username, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Hiba a bejelentkezés során:', error.message);
    return res.status(500).json({ message: 'Szerver hiba.' });
  }
});
// kijelentkezes, cookie torlese
router.get('/logout', requireAuth, (req, res) => {
  res.clearCookie('auth');
  res.locals.user = null;
  res.status(200).json({ message: 'Sikeres kijelentkezés' });
});

// Get current user
router.get('/current', requireAuth, (req, res) => {
  const token = req.cookies.auth;
  if (!token) {
    return res.status(401).json({ error: 'No token found' });
  }

  try {
    const user = jwt.verify(token, secret);
    return res.json(user);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});
export default router;
