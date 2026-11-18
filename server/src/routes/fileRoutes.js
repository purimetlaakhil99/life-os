import { Router } from 'express';
import { listFiles, uploadFile, downloadFile, deleteFile } from '../controllers/fileController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', listFiles);
router.post('/upload', uploadFile);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteFile);

export default router;
