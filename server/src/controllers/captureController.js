import { Task } from '../models/Task.js';
import { Event } from '../models/Event.js';
import { Memory } from '../models/Memory.js';

export async function universalCapture(req, res, next) {
  try {
    const { rawInput, captureType = 'text', metadata = {} } = req.body;
    const input = String(rawInput || '').trim();
    const lower = input.toLowerCase();

    let identifiedType = 'idea';
    let title = input.slice(0, 60);
    let details = input;

    // AI Classification Heuristics
    if (/http:\/\/|https:\/\//.test(input)) {
      identifiedType = 'reference';
      title = `Saved Link: ${input.slice(0, 40)}...`;
    } else if (/(remind me|todo|must do|finish|submit|complete|buy|pay)/i.test(lower)) {
      identifiedType = 'task';
    } else if (/(meeting|class|exam on|appointment|flight|party at)/i.test(lower) || /(am|pm|tomorrow|monday|friday)/i.test(lower)) {
      identifiedType = 'event';
    } else if (/(prefer|my rule|i like|i dislike|my allergic|birthday of|my friend)/i.test(lower)) {
      identifiedType = 'memory';
    }

    let createdEntity = null;

    if (identifiedType === 'task') {
      createdEntity = await Task.create({
        userId: req.userId,
        title: input.replace(/^(remind me to|todo:|task:)\s*/i, ''),
        priority: lower.includes('urgent') ? 'urgent' : 'medium',
        category: 'personal',
        description: `Captured via Universal Capture (${captureType})`,
      });
    } else if (identifiedType === 'event') {
      const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
      createdEntity = await Event.create({
        userId: req.userId,
        title: input,
        startTime: start,
        endTime: new Date(start.getTime() + 60 * 60 * 1000),
        category: 'personal',
        description: `Captured via Universal Capture (${captureType})`,
      });
    } else {
      // Stored as Idea / Reference / Memory
      createdEntity = await Memory.create({
        userId: req.userId,
        title: title || 'Universal Capture Note',
        content: input,
        category: identifiedType === 'reference' ? 'reference' : (identifiedType === 'memory' ? 'personal_info' : 'idea'),
        source: 'universal_capture',
        tags: [captureType, identifiedType],
      });
    }

    res.status(201).json({
      success: true,
      capturedContent: input,
      captureType,
      classifiedAs: identifiedType,
      createdEntity,
    });
  } catch (err) {
    next(err);
  }
}
