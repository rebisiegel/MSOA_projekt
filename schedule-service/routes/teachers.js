import express from 'express';
import axios from 'axios'; 
import { getTeachersSubjects } from '../db/subjects.js';
import { checkTeacherSchedule, checkYearSchedule } from '../db/schedule.js';
import { updateRequest, getUsersRequests } from '../db/requests.js';
import { requireTeacher } from '../middleware/auth.js'; 

const router = express.Router();

// 1. Megjeleníti a tanár saját tantárgyait
router.get('/teacher_subjects/:username', requireTeacher, async (req, res) => {
  const { username } = req.params;
  try {

    const subjects = await getTeachersSubjects(username);
    res.status(200).json({ subj: subjects, user: res.locals.user });
  } catch (err) {
    console.error('Hiba a tanár tantárgyainak megjelenítésekor', err);
    res.status(500).json({ error: 'Hiba lépett fel a tanár tantárgyainak megjelenítésekor' });
  }
});

// 2. Megjeleníti az oldalt, ahol a tanár kérést küldhet az adminnak (folyamatban lévő kérései)
router.get('/teacher_requests/:username', requireTeacher, async (req, res) => {
  const { username } = req.params;
  try {
    const requests = await getUsersRequests(username);
    res.status(200).json({ req: requests, user: res.locals.user });
  } catch (err) {
    console.error('Hiba a tanár kéréseinek lekérésekor', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Tanár órarendi kérést (időpont-módosítást) küld be
router.post('/teacher/request', requireTeacher, async (req, res) => {
  const { day, interval, username, subjectId } = req.body;

  if (!day || !interval) {
    return res.status(400).json({ err: 'Nem adtál meg minden adatot' });
  }

  try {
    // a) Tanári ütközés ellenőrzése
    const conflict = await checkTeacherSchedule(username, day, interval, subjectId);
    if (conflict) {
      return res.status(400).json({ err: 'Ütközés a tanár órarendjében' });
    }

    // b) Tantárgy adatok elkérése HTTP-n keresztül a subject-service-től
    const subjectServiceUrl = process.env.SUBJECT_SERVICE_INTERNAL_URL ;
    const subjectResponse = await axios.get(`${subjectServiceUrl}/api/subjects/tantargy/${subjectId}`);
    const subject = subjectResponse.data.subject;

    if (!subject) {
      return res.status(404).json({ err: 'A tantárgy nem található a katalógusban.' });
    }

    // c) Évfolyam/osztály ütközés ellenőrzése a kapott 'year' alapján
    const conflictYear = await checkYearSchedule(subject.year, day, interval, subjectId);
    if (conflictYear) {
      return res.status(400).json({ err: 'Ütközés az évfolyam órarendjében' });
    }

    const data = { day, interval, username, subjectId };
    await updateRequest(data);
    
    return res.status(200).json({ success: 'Kérelem sikeresen elküldve' });
  } catch (err) {
    console.error('Hiba az update során', err);
    return res.status(500).json({ error: 'Hiba történt az update során' });
  }
});

// 4. Megjeleníti a tanár kész órarendjét
router.get('/teacher_schedule/:username', requireTeacher, async (req, res) => {
  const { username } = req.params;
  try {
    const subjects = await getTeachersSubjects(username);
    subjects.sort((a, b) => {
      if (a.day !== b.day) {
        return a.day.localeCompare(b.day); // Rendezés nap szerint
      }
      return parseInt(a.interval.split('-')[0], 10) - parseInt(b.interval.split('-')[0], 10);
    });
    res.status(200).json({ subj: subjects, user: res.locals.user });
  } catch (err) {
    console.error('Hiba a tanár órarendjének lekérésekor', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;