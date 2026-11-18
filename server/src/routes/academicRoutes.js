import { Router } from 'express';
import {
  generateNotes,
  getNotesList,
  getNoteById,
  exportNotePDF,
  searchPapers,
  analyzePapers,
  uploadQuestionPaper,
  askStudyBuddy,
} from '../controllers/academicController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { noteGenerationSchema } from '../utils/validators.js';

const router = Router();
router.use(requireAuth);

router.post('/generate-notes', validate(noteGenerationSchema), generateNotes);
router.get('/notes', getNotesList);
router.get('/notes/:id', getNoteById);
router.get('/notes/:id/pdf', exportNotePDF);

router.get('/question-papers', searchPapers);
router.post('/question-papers/upload', uploadQuestionPaper);
router.post('/question-papers/analyze', analyzePapers);
router.post('/study-buddy/ask', askStudyBuddy);

export default router;
