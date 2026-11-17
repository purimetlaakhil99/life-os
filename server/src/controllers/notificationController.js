import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({
      userId: req.userId,
      $or: [
        { snoozedUntil: null },
        { snoozedUntil: { $lte: new Date() } },
      ],
    }).sort({ createdAt: -1 }).limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.userId,
      isRead: false,
    });

    res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.status(200).json(notification);
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

export async function snoozeNotification(req, res, next) {
  try {
    const { minutes = 15 } = req.body;
    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { snoozedUntil },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.status(200).json(notification);
  } catch (err) {
    next(err);
  }
}

export async function subscribePush(req, res, next) {
  try {
    const { subscription } = req.body;
    await User.findByIdAndUpdate(req.userId, { pushSubscription: subscription });
    res.status(200).json({ success: true, message: 'Push subscription registered.' });
  } catch (err) {
    next(err);
  }
}
