import express from 'express';
import path, { join } from 'path';
import fs from 'fs';
import multer from 'multer';
import { deleteFilesById, getFileById, saveFile } from '../db/files.js';
import { requireAuth } from '../middleware/auth.js';
import { getSubjectBySubjectId, getOwner } from '../db/subjects.js';

const uploadDir = join(process.cwd(), 'uploadDir');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const multerUpload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

const router = express.Router();

// megjeleniti az osszes feltoltott filet
router.get('/download/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(uploadDir, fileName);
  if (fs.existsSync(filePath)) {
    res.status(200).sendFile(filePath);
  } else {
    res.status(404).json({ error: 'A kért fájl nem található.' });
  }
});

// a fileok feltoltese
router.post('/upload', requireAuth, multerUpload.single('resource'), async (req, res) => {
  const fileHandler = req.file;

  if (!fileHandler) {
    return res.status(400).json({ error: 'Kerlek tolts fel egy filet' });
  }

  const fileName = fileHandler.filename;
  const { subjectId } = req.body;
  const { username } = req.user;

  try {
    const owner = await getOwner(subjectId);
    if (username !== owner) {
      return res.status(403).json({ message: 'Nincs jogod a feltolteshez' });
    }

    const subject = await getSubjectBySubjectId(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'A tantárgy nem található.' });
    }
    await saveFile(subjectId, fileName);
    return res.status(201).json({
      message: 'File sikeresen feltoltve',
      file: {
        fileName,
        subjectId,
      },
    });
  } catch (error) {
    console.error('Hiba történt a fájl nevének mentése közben:', error);
    return res.status(500).json({ message: 'Belső szerverhiba' });
  }
});

// a fileok torlese
router.delete('/deleteFile/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const { username } = req.user;

    const file = await getFileById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File nem talalhato' });
    }

    const owner = await getOwner(file.subject_id);

    if (owner !== username) {
      return res.status(403).json({ message: 'Nincs jogod a torlesre' });
    }
    await deleteFilesById(fileId);
    return res.status(200).json({ message: 'File sikeresen torolve' });
  } catch (error) {
    console.error('hiba a file torlese soran', error);
    return res.status(500).json({ message: 'Hiba történt a törlés során' });
  }
});

export default router;
