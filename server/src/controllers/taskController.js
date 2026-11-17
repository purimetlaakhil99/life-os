import { Task } from '../models/Task.js';
import { ScheduledJob } from '../models/ScheduledJob.js';

export async function getTasks(req, res, next) {
  try {
    const { status, priority, category, date } = req.query;
    const filter = { userId: req.userId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.dueDate = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(filter).sort({ priority: -1, dueDate: 1, createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const { title, description, priority, dueDate, reminderTime, isRecurring, recurrenceRule, category, tags } = req.body;

    const task = await Task.create({
      userId: req.userId,
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      reminderTime: reminderTime ? new Date(reminderTime) : null,
      isRecurring,
      recurrenceRule,
      category,
      tags,
    });

    // If reminderTime is set, create a durable scheduled job
    if (reminderTime && new Date(reminderTime) > new Date()) {
      await ScheduledJob.create({
        userId: req.userId,
        jobType: 'task_reminder',
        scheduledFor: new Date(reminderTime),
        idempotencyKey: `task_rem_${task._id}_${Date.now()}`,
        payload: { taskId: task._id },
      });
    }

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

export async function toggleTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    task.completedAt = task.status === 'completed' ? new Date() : null;
    await task.save();

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const result = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
}
