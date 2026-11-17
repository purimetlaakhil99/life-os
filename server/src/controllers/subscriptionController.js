import { Subscription } from '../models/Subscription.js';

export async function getSubscriptions(req, res, next) {
  try {
    const subscriptions = await Subscription.find({ userId: req.userId }).sort({ nextBillingDate: 1 });
    res.status(200).json(subscriptions);
  } catch (err) {
    next(err);
  }
}

export async function createSubscription(req, res, next) {
  try {
    const sub = await Subscription.create({
      userId: req.userId,
      ...req.body,
    });
    res.status(201).json(sub);
  } catch (err) {
    next(err);
  }
}

export async function deleteSubscription(req, res, next) {
  try {
    const result = await Subscription.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ error: 'Subscription not found' });
    res.status(200).json({ message: 'Subscription removed' });
  } catch (err) {
    next(err);
  }
}
