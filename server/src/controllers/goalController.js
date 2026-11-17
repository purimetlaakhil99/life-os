import { Goal } from '../models/Goal.js';

export async function getGoals(req, res, next) {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.status(200).json(goals);
  } catch (err) {
    next(err);
  }
}

export async function createGoal(req, res, next) {
  try {
    const goal = await Goal.create({
      userId: req.userId,
      ...req.body,
    });
    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
}

export async function updateGoal(req, res, next) {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body },
      { new: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.status(200).json(goal);
  } catch (err) {
    next(err);
  }
}

export async function deleteGoal(req, res, next) {
  try {
    const result = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ error: 'Goal not found' });
    res.status(200).json({ message: 'Goal removed successfully' });
  } catch (err) {
    next(err);
  }
}

export async function logHabit(req, res, next) {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ error: 'Habit record not found' });

    const existingEntryIndex = goal.history.findIndex(h => h.date === date);
    if (existingEntryIndex > -1) {
      goal.history[existingEntryIndex].completed = !goal.history[existingEntryIndex].completed;
    } else {
      goal.history.push({ date, completed: true });
    }

    // Recalculate streak
    const completedDays = goal.history.filter(h => h.completed).length;
    goal.streak = completedDays;
    goal.lastCompletedDate = date;

    await goal.save();
    res.status(200).json(goal);
  } catch (err) {
    next(err);
  }
}
