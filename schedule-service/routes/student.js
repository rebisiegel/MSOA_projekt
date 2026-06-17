import express from 'express';
import { getStudentsSubjects } from '../db/subjects.js';
import { requireStudent } from '../middleware/auth.js';

const router = express.Router();

function sortBySchedule(subjects) {
  subjects.sort((a, b) => {
    if (a.day !== b.day) {
      return a.day.localeCompare(b.day);
    }
    return parseInt(a.interval.split('-')[0], 10) - parseInt(b.interval.split('-')[0], 10);
  });
}

// 1. Diák felvett tantárgyainak listája
router.get('/student_subjects/:username', requireStudent, async (req, res) => {
  const { username } = req.params;
  try {
  
    const subjects = await getStudentsSubjects(username);
    return res.status(200).json({ subj: subjects, user: res.locals.user });
  } catch (err) {
    console.error('Hiba a diák tantárgyainak megjelenítésében', err);
    return res.status(500).json({ error: 'Hiba lépett fel a diák tantárgyainak megjelenítésekor' });
  }
});

// 2. Diák órarendjének lekérése
router.get('/student_schedule/:username', requireStudent, async (req, res) => {
  const { username } = req.params;
  try {
    const subjects = await getStudentsSubjects(username);
    sortBySchedule(subjects);
    return res.status(200).json({ subj: subjects, user: res.locals.user });
  } catch (err) {
    console.error('Hiba a diák órarendjének lekérésekor', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;