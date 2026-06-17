import express from 'express';
import axios from 'axios';
import { getAllRequests, acceptRequest, rejectRequest, addRequest } from '../db/requests.js';
import { requireAdmin } from '../middleware/auth.js';
import { getAllSubject } from '../db/subjects.js';
import { checkTeacherSchedule, checkYearSchedule } from '../db/schedule.js';

const router = express.Router();

// GET /admin, megjeleniti az kereseket amiket jo kell hagyjon s az osszesitett orarendet
router.get('/admin/requests', requireAdmin, async (req, res) => {
  const { username } = res.locals.user;
  try {
   
      const requests = await getAllRequests();
      const subjects = await getAllSubject();
      
      subjects.sort((a, b) => {
        if (a.day !== b.day) {
          return a.day.localeCompare(b.day);
        }
        return parseInt(a.interval.split('-')[0], 10) - parseInt(b.interval.split('-')[0], 10);
      });

      res.status(200).json({ request: requests, subj: subjects, user: res.locals.user });
   
  } catch (err) {
    console.error('Hiba a kérelmek vagy órarend megjelenítésekor', err);
    res.status(500).send('Hiba lépett fel a kérelmek vagy órarend megjelenítésekor');
  }
});

// POST /admin/request, elfogadja vagy elutasitja a kereset figyelembe veve a tanarok es osztaly orarendjet
router.post('/admin/request', requireAdmin, async (req, res) => {
  const { username, subjectId, day, interval, accept } = req.body;
  console.log(req.body);
  const data = {
    username,
    subjectId,
  };

  try {
    if (accept) {
      const conflict = await checkTeacherSchedule(username, day, interval, subjectId);
      if (conflict) {
        return res.status(400).json({ err: 'Ütközés a tanár órarendjében' });
      }

      const subjectServiceUrl = process.env.SUBJECT_SERVICE_INTERNAL_URL ;
      const subjectResponse = await axios.get(`${subjectServiceUrl}/api/subjects/tantargy/${subjectId}`);
      const subjectData = subjectResponse.data.subject;

      if (!subjectData) {
        return res.status(404).json({ err: 'A tantárgy nem található a katalógusban.' });
      }

      const conflictYear = await checkYearSchedule(subjectData.year, day, interval, subjectId);
      if (conflictYear) {
        return res.status(400).json({ err: 'Ütközés az osztály órarendjében' });
      }

      await acceptRequest(data);
    } else {
      await rejectRequest(data);
    }
    return res.status(200).json({ message: 'Request processed successfully' });
  } catch (err) {
    console.error('Hiba a kérelem frissítésekor', err);
    return res.status(500).json({ error: 'Hiba lépett fel a kérelem frissítésekor' });
  }
});

// BELSŐ VÉGPONT: A subject-service hívja meg HTTP-n keresztül, amikor új tantárgy jön létre

router.post('/internal/request', async (req, res) => {
  const { username, subjectId } = req.body;
  try {
    const data = { username, subjectId };
    await addRequest(data); 
    console.log(`[Internal] Sikeresen létrehozva órarendi kérés a tárgyhoz: ${subjectId}`);
    return res.status(201).json({ message: 'Internal request created successfully' });
  } catch (err) {
    console.error('Hiba a belső kérelem létrehozásakor:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
export default router;
