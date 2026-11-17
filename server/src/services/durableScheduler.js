// LIFE OS Durable Background Job Scheduler & Notification Engine
import { ScheduledJob } from '../models/ScheduledJob.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { Contact } from '../models/Contact.js';
import { Task } from '../models/Task.js';
import { sendGmailMessage } from './gmailService.js';
import { generateBirthdayMessage } from './aiBrainService.js';

let schedulerInterval = null;

export async function processPendingJobs() {
  const now = new Date();

  // Find due jobs that are not locked
  const dueJobs = await ScheduledJob.find({
    status: 'pending',
    scheduledFor: { $lte: now },
  }).limit(10);

  for (const job of dueJobs) {
    // Lock the job to prevent duplicate execution across workers
    const lockedJob = await ScheduledJob.findOneAndUpdate(
      { _id: job._id, status: 'pending' },
      { status: 'processing', lockedAt: new Date() },
      { new: true }
    );

    if (!lockedJob) continue;

    try {
      await executeJob(lockedJob);

      lockedJob.status = 'completed';
      lockedJob.completedAt = new Date();
      await lockedJob.save();
    } catch (err) {
      console.error(`[Scheduler] Job execution failed for job ${lockedJob._id}:`, err.message);
      lockedJob.attempts += 1;
      lockedJob.lastError = err.message;
      lockedJob.status = lockedJob.attempts >= lockedJob.maxAttempts ? 'failed' : 'pending';
      // If retryable, back off by 5 minutes
      if (lockedJob.status === 'pending') {
        lockedJob.scheduledFor = new Date(Date.now() + 5 * 60 * 1000);
      }
      await lockedJob.save();
    }
  }
}

async function executeJob(job) {
  const { userId, jobType, payload } = job;
  const user = await User.findById(userId);
  if (!user) throw new Error(`User not found: ${userId}`);

  switch (jobType) {
    case 'birthday_email': {
      const contact = await Contact.findById(payload.contactId);
      if (!contact || !contact.autoBirthdayEmail) {
        return;
      }

      const currentYear = new Date().getFullYear();
      if (contact.lastWishSentYear === currentYear) {
        console.log(`[BirthdayWorker] Wish already sent to ${contact.name} for year ${currentYear}. Skipping.`);
        return;
      }

      // Check if Gmail is connected
      if (!user.googleAuth?.connected || !user.googleAuth?.encryptedRefreshToken) {
        throw new Error(`Gmail not connected for user ${user.email}. Cannot send birthday email.`);
      }

      // Determine wish message
      let message = contact.approvedCustomMessage;
      if (!message) {
        message = generateBirthdayMessage({
          name: contact.name,
          language: contact.preferredLanguage || 'en',
          style: contact.messageStyle || 'heartfelt',
          notes: contact.personalNotes,
        });
      }

      // Send via Gmail
      const result = await sendGmailMessage({
        encryptedRefreshToken: user.googleAuth.encryptedRefreshToken,
        to: contact.email,
        from: user.email,
        subject: `Happy Birthday, ${contact.name}! 🎂🎉`,
        body: message,
      });

      // Update contact records
      contact.lastWishSentYear = currentYear;
      contact.deliveryStatus = {
        lastSentAt: new Date(),
        status: 'sent',
      };
      await contact.save();

      // Create in-app notification for the user
      await Notification.create({
        userId,
        title: `Birthday Email Dispatched to ${contact.name}! 🎂`,
        message: `Your automated birthday greeting was successfully dispatched to ${contact.email} via Gmail.`,
        type: 'birthday',
        priority: 'normal',
      });

      // Schedule next year's recurring birthday job
      const nextBirthday = new Date(contact.birthday);
      nextBirthday.setFullYear(currentYear + 1);
      const [hours, minutes] = (contact.birthdaySendTime || '09:00').split(':').map(Number);
      nextBirthday.setHours(hours, minutes, 0, 0);

      const nextIdempotencyKey = `bday_${contact._id}_${currentYear + 1}`;
      await ScheduledJob.create({
        userId,
        jobType: 'birthday_email',
        scheduledFor: nextBirthday,
        idempotencyKey: nextIdempotencyKey,
        payload: { contactId: contact._id },
      });

      break;
    }

    case 'task_reminder': {
      const task = await Task.findById(payload.taskId);
      if (task && task.status !== 'completed') {
        await Notification.create({
          userId,
          title: `Task Reminder: ${task.title}`,
          message: `Due reminder: ${task.title} (Priority: ${task.priority.toUpperCase()})`,
          type: 'reminder',
          priority: task.priority === 'urgent' ? 'urgent' : 'high',
          actionUrl: '/my-day',
        });
      }
      break;
    }

    case 'class_reminder': {
      await Notification.create({
        userId,
        title: `Upcoming Class: ${payload.subjectName}`,
        message: `Class starts at ${payload.startTime} in ${payload.classroom || 'Lecture Hall'} (${payload.faculty || 'Faculty'}).`,
        type: 'academic',
        priority: 'high',
        actionUrl: '/student-life',
      });
      break;
    }

    case 'daily_briefing': {
      await Notification.create({
        userId,
        title: `Your Morning AI Daily Briefing is Ready! ☀️`,
        message: `Check your schedule, deadlines, and classes planned for today.`,
        type: 'briefing',
        priority: 'normal',
        actionUrl: '/home',
      });
      break;
    }

    default:
      console.warn(`[Scheduler] Unknown job type: ${jobType}`);
  }
}

/**
 * Start the durable background job polling engine
 */
export function startScheduler(pollIntervalMs = 15000) {
  if (schedulerInterval) return;
  console.log(`[DurableScheduler] Engine started (polling every ${pollIntervalMs / 1000}s)`);
  schedulerInterval = setInterval(async () => {
    try {
      await processPendingJobs();
    } catch (err) {
      console.error('[DurableScheduler] Polling tick error:', err.message);
    }
  }, pollIntervalMs);
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}
