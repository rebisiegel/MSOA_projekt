import express from 'express';
import { saveSyllabus } from '../db/syllabus.js';

const router = express.Router();
router.post('/syllabus/:subjectId', async (req, res) => {
  try {
    const { syllabus } = req.body;
    const { subjectId } = req.params;

    await saveSyllabus(subjectId, syllabus);
    return res.send({ success: true });
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
});

export default router;
