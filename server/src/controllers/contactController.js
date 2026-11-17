import { Contact } from '../models/Contact.js';
import { ScheduledJob } from '../models/ScheduledJob.js';
import { generateBirthdayMessage } from '../services/aiBrainService.js';

export async function getContacts(req, res, next) {
  try {
    const contacts = await Contact.find({ userId: req.userId }).sort({ birthday: 1 });
    res.status(200).json(contacts);
  } catch (err) {
    next(err);
  }
}

export async function createContact(req, res, next) {
  try {
    const contact = await Contact.create({
      userId: req.userId,
      ...req.body,
    });

    // If autoBirthdayEmail is already true, schedule the job immediately
    if (contact.autoBirthdayEmail) {
      await scheduleBirthdayJob(contact, req.userId);
    }

    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
}

export async function updateContact(req, res, next) {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body },
      { new: true }
    );
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    if (contact.autoBirthdayEmail) {
      await scheduleBirthdayJob(contact, req.userId);
    } else {
      // Cancel pending jobs if auto send is toggled off
      await ScheduledJob.deleteMany({
        userId: req.userId,
        jobType: 'birthday_email',
        'payload.contactId': contact._id,
        status: 'pending',
      });
    }

    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
}

export async function deleteContact(req, res, next) {
  try {
    const result = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ error: 'Contact not found' });

    await ScheduledJob.deleteMany({
      userId: req.userId,
      'payload.contactId': req.params.id,
    });

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function generateWish(req, res, next) {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.userId });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const { language = contact.preferredLanguage || 'en', style = contact.messageStyle || 'heartfelt' } = req.body;
    const wish = generateBirthdayMessage({
      name: contact.name,
      language,
      style,
      notes: contact.personalNotes,
    });

    res.status(200).json({
      name: contact.name,
      language,
      style,
      wish,
    });
  } catch (err) {
    next(err);
  }
}

export async function scheduleAutomation(req, res, next) {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.userId });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const { autoBirthdayEmail = true, birthdaySendTime = '09:00', approvedCustomMessage } = req.body;

    contact.autoBirthdayEmail = autoBirthdayEmail;
    contact.birthdaySendTime = birthdaySendTime;
    if (approvedCustomMessage !== undefined) {
      contact.approvedCustomMessage = approvedCustomMessage;
    }
    contact.deliveryStatus.status = 'scheduled';
    await contact.save();

    if (autoBirthdayEmail) {
      await scheduleBirthdayJob(contact, req.userId);
    }

    res.status(200).json({
      message: 'Automatic birthday email successfully scheduled with durable recurring worker.',
      contact,
    });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const jobs = await ScheduledJob.find({
      userId: req.userId,
      jobType: 'birthday_email',
    }).sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (err) {
    next(err);
  }
}

async function scheduleBirthdayJob(contact, userId) {
  const currentYear = new Date().getFullYear();
  const bday = new Date(contact.birthday);

  const targetDate = new Date();
  targetDate.setFullYear(currentYear, bday.getMonth(), bday.getDate());

  const [hours, minutes] = (contact.birthdaySendTime || '09:00').split(':').map(Number);
  targetDate.setHours(hours, minutes, 0, 0);

  // If already passed this year, schedule for next year
  if (targetDate < new Date()) {
    targetDate.setFullYear(currentYear + 1);
  }

  const idempotencyKey = `bday_${contact._id}_${targetDate.getFullYear()}`;

  // Upsert scheduled job
  await ScheduledJob.findOneAndUpdate(
    { idempotencyKey },
    {
      userId,
      jobType: 'birthday_email',
      scheduledFor: targetDate,
      status: 'pending',
      payload: { contactId: contact._id },
    },
    { upsert: true, new: true }
  );
}
