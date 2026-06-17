import express from 'express';
import axios from 'axios';
import { getAllSubject, getSubjectBySubjectId, getOwner, addSubject } from '../db/subjects.js';
import { getFilesBySubjectId } from '../db/files.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// megjelenit minden tantargyat
router.get('/all', async (req, res) => {
  try {
    const subjects = await getAllSubject();
    if (!subjects) {
      res.status(404).send('Nincs tantárgy.');
    }

    res.status(200).json({ subjects, user: res.locals.user });
  } catch (error) {
    console.error(`Error fetching subjects: ${error.message}`);
    res.status(500).send('Internal Server Error');
  }
});

// megjeleniti az adott tantargy reszletes oldalat
router.get(['/tantargy/:id'], async (req, res) => {
  try {
    let isOwner = false;
    const subjectId = req.params.id;
    const [subject, files] = await Promise.all([getSubjectBySubjectId(subjectId), getFilesBySubjectId(subjectId)]);

    if (!subject) {
      return res.status(404).send('A tantárgy nem található.');
    }

    if (req.user && req.user.username) {
      const { username } = req.user;
      const owner = await getOwner(subjectId);
      isOwner = owner === username;
    }

    return res.status(200).json({ subject, files, user: res.locals.user, isOwner });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


// uj tantargy hozzaadasa
router.get('/admin/newSubject', requireAdmin, async (req, res) => {
  try {
    const userServiceUrl = process.env.USER_SERVICE_INTERNAL_URL ;
    const response = await axios.get(`${userServiceUrl}/api/users/teachers`, {
      headers: { Cookie: req.headers.cookie }
    });
    const teachers = response.data.teachers || response.data;
    res.json({ teachers });
  } catch (error) {
    console.error('Nem sikerült elérni a user-service-t a tanárokért:', error.message);
    res.json({ teachers: [] });
  }
});

// tantárgy elmentése
router.post('/admin/submit', requireAdmin, async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(401).json({ error: 'Be kell jelentkezned a tantárgy hozzáadásához.' });
    }

    const existingSubject = await getSubjectBySubjectId(req.body.subjectId);
    if (existingSubject) {
      return res.status(400).json({ error: 'A tantárgy kódja már létezik' });
    }

    const data = {
      subjectId: req.body.subjectId,
      subject: req.body.subject,
      year: req.body.year,
      curs: req.body.curs,
      seminar: req.body.seminar,
      lab: req.body.lab,
      owner: req.body.teacher,
    };

    await addSubject(data);
    try {      
      const scheduleServiceUrl = process.env.SCHEDULE_SERVICE_INTERNAL_URL;
      await axios.post(`${scheduleServiceUrl}/api/schedules/internal/request`, {
        username: req.body.owner,
        subjectId: req.body.subjectId
      });
     
    } catch (schedErr) {
      console.error('Nem sikerült automatikus kérést létrehozni a schedule-service-ben:', schedErr);
    }

    return res.status(200).json({ success: 'Sikeres mentés' });
  } catch (error) {
    console.error('Hiba tantárgy hozzáadásakor:', error);
    return res.status(500).json({ error: 'Belső szerverhiba' });
  }
});

export default router;
