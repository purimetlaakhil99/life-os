import { CareerItem } from '../models/CareerItem.js';

export async function listCareerItems(req, res, next) {
  try {
    const { type } = req.query;
    const filter = { userId: req.userId };
    if (type) filter.type = type;

    const items = await CareerItem.find(filter).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
}

export async function createCareerItem(req, res, next) {
  try {
    const { type, title, organization, status, date, amount, difficulty, notes, link } = req.body;
    if (!type || !title) {
      return res.status(400).json({ error: 'type and title are required' });
    }

    const item = await CareerItem.create({
      userId: req.userId,
      type,
      title,
      organization: organization || '',
      status: status || 'active',
      date: date ? new Date(date) : null,
      amount: Number(amount) || 0,
      difficulty: difficulty || 'na',
      notes: notes || '',
      link: link || '',
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateCareerItem(req, res, next) {
  try {
    const item = await CareerItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Career item not found' });
    res.status(200).json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteCareerItem(req, res, next) {
  try {
    const result = await CareerItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ error: 'Career item not found' });
    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
}
