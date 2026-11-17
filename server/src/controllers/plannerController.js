import { Event } from '../models/Event.js';
import { Task } from '../models/Task.js';
import { StudentProfile } from '../models/StudentProfile.js';

export async function getSchedule(req, res, next) {
  try {
    const { start, end } = req.query;
    const userId = req.userId;

    const startDate = start ? new Date(start) : new Date(new Date().setHours(0, 0, 0, 0));
    const endDate = end ? new Date(end) : new Date(new Date().setHours(23, 59, 59, 999));

    // 1. Fetch Calendar Events
    const events = await Event.find({
      userId,
      startTime: { $lte: endDate },
      endTime: { $gte: startDate },
    }).sort({ startTime: 1 });

    // 2. Fetch Tasks due in this range
    const tasks = await Task.find({
      userId,
      dueDate: { $gte: startDate, $lte: endDate },
    }).sort({ dueDate: 1 });

    // 3. Fetch Class Timetable for today/dates
    const studentProfile = await StudentProfile.findOne({ userId });
    const timetableSlots = [];

    if (studentProfile && studentProfile.timetable) {
      const dayOfWeek = startDate.getDay() || 7;
      const todayClasses = studentProfile.timetable.filter(t => t.dayOfWeek === dayOfWeek);

      todayClasses.forEach(cls => {
        const [sh, sm] = cls.startTime.split(':').map(Number);
        const [eh, em] = cls.endTime.split(':').map(Number);
        const classStart = new Date(startDate);
        classStart.setHours(sh, sm, 0, 0);
        const classEnd = new Date(startDate);
        classEnd.setHours(eh, em, 0, 0);

        timetableSlots.push({
          id: cls._id,
          title: `${cls.subjectName} (${cls.classroom || 'Room'})`,
          category: 'class',
          faculty: cls.faculty,
          startTime: classStart,
          endTime: classEnd,
          isClass: true,
        });
      });
    }

    res.status(200).json({
      events,
      tasks,
      classes: timetableSlots,
    });
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req, res, next) {
  try {
    const { title, description, startTime, endTime, category, location, allDay } = req.body;
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 60 * 60 * 1000);

    // Conflict detection
    const conflictingEvent = await Event.findOne({
      userId: req.userId,
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
      ],
    });

    const event = await Event.create({
      userId: req.userId,
      title,
      description,
      startTime: start,
      endTime: end,
      category: category || 'personal',
      location: location || '',
      allDay: Boolean(allDay),
    });

    res.status(201).json({
      event,
      conflictDetected: Boolean(conflictingEvent),
      conflictWarning: conflictingEvent
        ? `Warning: This overlaps with "${conflictingEvent.title}" (${new Date(conflictingEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(conflictingEvent.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
        : null,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const result = await Event.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ error: 'Event not found' });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
}
