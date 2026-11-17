import { processAIChat, createActionPreview, executeConfirmedAction } from '../services/aiBrainService.js';
import { Task } from '../models/Task.js';
import { Event } from '../models/Event.js';
import { Contact } from '../models/Contact.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { calculateAttendanceStats } from '../services/attendanceService.js';

export async function handleAIChat(req, res, next) {
  try {
    const { message, language = req.user.preferredLanguage || 'en', mode = 'chat' } = req.body;
    if (!message || String(message).trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const response = await processAIChat({
      message,
      userId: req.userId,
      language,
      mode,
    });

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function previewAction(req, res, next) {
  try {
    const { actionName, params } = req.body;
    const preview = createActionPreview(actionName, params, req.userId);
    res.status(200).json(preview);
  } catch (err) {
    next(err);
  }
}

export async function confirmAction(req, res, next) {
  try {
    const { actionToken } = req.body;
    const result = await executeConfirmedAction(actionToken, req.userId);
    res.status(200).json({ success: true, result });
  } catch (err) {
    next(err);
  }
}

export async function getDailyBriefing(req, res, next) {
  try {
    const userId = req.userId;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Fetch today's tasks
    const pendingTasks = await Task.find({
      userId,
      status: { $ne: 'completed' },
    }).sort({ priority: -1 }).limit(5);

    // Fetch today's schedule events
    const todayEvents = await Event.find({
      userId,
      startTime: { $gte: startOfToday, $lte: endOfToday },
    }).sort({ startTime: 1 });

    // Upcoming birthdays (within 7 days)
    const contacts = await Contact.find({ userId });
    const currentMonth = new Date().getMonth();
    const upcomingBirthdays = contacts.filter(c => {
      const bday = new Date(c.birthday);
      return bday.getMonth() === currentMonth;
    }).slice(0, 3);

    // Next class if student profile exists
    const profile = await StudentProfile.findOne({ userId });
    let nextClass = null;
    let attendanceAlert = null;

    if (profile && profile.timetable && profile.timetable.length > 0) {
      const todayDayOfWeek = new Date().getDay() || 7; // 1 to 7
      const todayClasses = profile.timetable
        .filter(t => t.dayOfWeek === todayDayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      const currentTime = new Date().toTimeString().slice(0, 5);
      nextClass = todayClasses.find(c => c.startTime >= currentTime) || todayClasses[0] || null;
    }

    // Check for critical attendance warnings
    const attendanceRecords = await AttendanceRecord.find({ userId });
    for (const record of attendanceRecords) {
      const stats = calculateAttendanceStats(record.attendedClasses, record.totalClasses, record.targetPercentage);
      if (stats.isShortage) {
        attendanceAlert = {
          subject: record.subjectName,
          percentage: stats.percentage,
          target: stats.targetPercentage,
          classesNeeded: stats.classesToReachTarget,
          statusLabel: stats.statusLabel,
        };
        break;
      }
    }

    // Compose concise briefing
    const greeting = `Good day, ${req.user.name}!`;
    const summary = `You have ${pendingTasks.length} pending task(s) and ${todayEvents.length} event(s) scheduled for today.${nextClass ? ` Next class: ${nextClass.subjectName} at ${nextClass.startTime} in ${nextClass.classroom}.` : ''}${attendanceAlert ? ` ⚠️ Attendance Alert: ${attendanceAlert.subject} is at ${attendanceAlert.percentage}%. Attend the next ${attendanceAlert.classesNeeded} classes to recover.` : ''}`;

    res.status(200).json({
      greeting,
      summary,
      pendingTasks,
      todayEvents,
      upcomingBirthdays,
      nextClass,
      attendanceAlert,
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    });
  } catch (err) {
    next(err);
  }
}
