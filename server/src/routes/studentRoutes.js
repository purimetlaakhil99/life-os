import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getTimetable,
  addTimetableSlot,
  deleteTimetableSlot,
  getAttendance,
  logAttendance,
  getAssignments,
  createAssignment,
  updateAssignment,
  getPerformance,
  calculateWhatIf,
} from '../controllers/studentController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

// Student Profile
router.get('/profile', getProfile);
router.post('/profile', updateProfile);

// Timetable
router.get('/timetable', getTimetable);
router.post('/timetable', addTimetableSlot);
router.delete('/timetable/:id', deleteTimetableSlot);

// Attendance Intelligence
router.get('/attendance', getAttendance);
router.post('/attendance/log', logAttendance);

// Assignments
router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.put('/assignments/:id', updateAssignment);

// Performance & CGPA
router.get('/performance', getPerformance);
router.post('/performance/what-if', calculateWhatIf);

export default router;
