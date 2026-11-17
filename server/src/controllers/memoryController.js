import { Memory } from '../models/Memory.js';

export async function getMemories(req, res, next) {
  try {
    const { search, category } = req.query;
    const filter = { userId: req.userId };

    if (category) filter.category = category;
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: regex }, { content: regex }, { tags: regex }];
    }

    const memories = await Memory.find(filter).sort({ importance: -1, updatedAt: -1 });
    res.status(200).json(memories);
  } catch (err) {
    next(err);
  }
}

export async function createMemory(req, res, next) {
  try {
    const memory = await Memory.create({
      userId: req.userId,
      ...req.body,
    });
    res.status(201).json(memory);
  } catch (err) {
    next(err);
  }
}

export async function updateMemory(req, res, next) {
  try {
    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body },
      { new: true }
    );
    if (!memory) return res.status(404).json({ error: 'Memory record not found' });
    res.status(200).json(memory);
  } catch (err) {
    next(err);
  }
}

export async function deleteMemory(req, res, next) {
  try {
    const result = await Memory.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ error: 'Memory record not found' });
    res.status(200).json({ message: 'Memory successfully deleted' });
  } catch (err) {
    next(err);
  }
}
