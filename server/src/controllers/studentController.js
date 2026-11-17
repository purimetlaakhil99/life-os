import { StudentProfile } from '../models/StudentProfile.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { Assignment } from '../models/Assignment.js';
import { calculateAttendanceStats } from '../services/attendanceService.js';
import { calculateSGPA, calculateCGPA, calculateWhatIfTarget } from '../services/gpaService.js';

// Profile
export async function getProfile(req, res, next) {
  try {
    let profile = await StudentProfile.findOne({ userId: req.userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId: req.userId });
    }
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.userId },
      { ...req.body },
      { new: true, upsert: true }
    );
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

// Timetable
export async function getTimetable(req, res, next) {
  try {
    const profile = await StudentProfile.findOne({ userId: req.userId });
    res.status(200).json(profile?.timetable || []);
  } catch (err) {
    next(err);
  }
}

export async function addTimetableSlot(req, res, next) {
  try {
    const { dayOfWeek, subjectName, subjectCode, faculty, classroom, startTime, endTime } = req.body;
    let profile = await StudentProfile.findOne({ userId: req.userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId: req.userId });
    }

    profile.timetable.push({
      dayOfWeek: Number(dayOfWeek),
      subjectName,
      subjectCode: subjectCode || '',
      faculty: faculty || '',
      classroom: classroom || '',
      startTime,
      endTime,
    });

    await profile.save();

    // Ensure AttendanceRecord exists for this subject
    const existingAtt = await AttendanceRecord.findOne({ userId: req.userId, subjectName });
    if (!existingAtt) {
      await AttendanceRecord.create({
        userId: req.userId,
        subjectName,
        subjectCode: subjectCode || '',
        targetPercentage: profile.attendanceTarget || 75,
      });
    }

    res.status(201).json(profile.timetable);
  } catch (err) {
    next(err);
  }
}

export async function deleteTimetableSlot(req, res, next) {
  try {
    const profile = await StudentProfile.findOne({ userId: req.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.timetable = profile.timetable.filter(slot => String(slot._id) !== String(req.params.id));
    await profile.save();
    res.status(200).json(profile.timetable);
  } catch (err) {
    next(err);
  }
}

// Attendance
export async function getAttendance(req, res, next) {
  try {
    const records = await AttendanceRecord.find({ userId: req.userId });
    const profile = await StudentProfile.findOne({ userId: req.userId });
    const target = profile?.attendanceTarget || 75;

    const enriched = records.map(r => {
      const stats = calculateAttendanceStats(r.attendedClasses, r.totalClasses, r.targetPercentage || target);
      return {
        _id: r._id,
        subjectName: r.subjectName,
        subjectCode: r.subjectCode,
        history: r.history,
        ...stats,
      };
    });

    res.status(200).json(enriched);
  } catch (err) {
    next(err);
  }
}

export async function logAttendance(req, res, next) {
  try {
    const { subjectName, status, notes } = req.body;
    let record = await AttendanceRecord.findOne({ userId: req.userId, subjectName });

    if (!record) {
      record = await AttendanceRecord.create({
        userId: req.userId,
        subjectName,
        totalClasses: 0,
        attendedClasses: 0,
      });
    }

    if (status === 'present') {
      record.totalClasses += 1;
      record.attendedClasses += 1;
    } else if (status === 'absent') {
      record.totalClasses += 1;
    }
    // 'cancelled' does not increment total or attended

    record.history.unshift({
      date: new Date(),
      status,
      notes: notes || '',
    });

    await record.save();

    const stats = calculateAttendanceStats(record.attendedClasses, record.totalClasses, record.targetPercentage);
    res.status(200).json({ record, ...stats });
  } catch (err) {
    next(err);
  }
}

// Assignments
export async function getAssignments(req, res, next) {
  try {
    const assignments = await Assignment.find({ userId: req.userId }).sort({ dueDate: 1 });
    res.status(200).json(assignments);
  } catch (err) {
    next(err);
  }
}

export async function createAssignment(req, res, next) {
  try {
    const assignment = await Assignment.create({
      userId: req.userId,
      ...req.body,
    });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function updateAssignment(req, res, next) {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body },
      { new: true }
    );
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.status(200).json(assignment);
  } catch (err) {
    next(err);
  }
}

// Academic Performance & GPA
export async function getPerformance(req, res, next) {
  try {
    const profile = await StudentProfile.findOne({ userId: req.userId });
    res.status(200).json({
      gradingSystem: profile?.gradingSystem || { scale: '10-point' },
      university: profile?.university || 'University',
      semester: profile?.semester || 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function calculateWhatIf(req, res, next) {
  try {
    const { currentCGPA, completedCredits, upcomingCredits, targetCGPA, subjects } = req.body;

    if (subjects && Array.isArray(subjects)) {
      const sgpaResult = calculateSGPA(subjects);
      return res.status(200).json(sgpaResult);
    }

    const sim = calculateWhatIfTarget(
      Number(currentCGPA) || 8.0,
      Number(completedCredits) || 80,
      Number(upcomingCredits) || 20,
      Number(targetCGPA) || 8.5
    );

    res.status(200).json(sim);
  } catch (err) {
    next(err);
  }
}
