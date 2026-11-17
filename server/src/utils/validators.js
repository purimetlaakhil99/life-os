import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    role: z.enum(['user', 'student']).optional(),
    preferredLanguage: z.enum(['en', 'hi', 'te']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const taskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    dueDate: z.string().nullable().optional(),
    reminderTime: z.string().nullable().optional(),
    isRecurring: z.boolean().optional(),
    recurrenceRule: z.enum(['daily', 'weekly', 'monthly', 'custom', 'none']).optional(),
    category: z.enum(['personal', 'academic', 'career', 'health', 'finance', 'routine']).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const eventSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Event title is required').max(200),
    description: z.string().optional(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    allDay: z.boolean().optional(),
    location: z.string().optional(),
    category: z.enum(['class', 'exam', 'personal', 'meeting', 'routine', 'focus_session']).optional(),
    recurrence: z.string().optional(),
  }),
});

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Contact name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    relationship: z.enum(['family', 'friend', 'colleague', 'mentor', 'classmate', 'other']).optional(),
    birthday: z.string().min(1, 'Birthday date is required'),
    preferredLanguage: z.enum(['en', 'hi', 'te']).optional(),
    messageStyle: z.enum(['friendly', 'emotional', 'heartfelt', 'funny', 'simple', 'personalized']).optional(),
    personalNotes: z.string().optional(),
    autoBirthdayEmail: z.boolean().optional(),
    birthdaySendTime: z.string().optional(),
    approvedCustomMessage: z.string().optional(),
  }),
});

export const memorySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    category: z.enum(['preference', 'routine', 'relationship', 'personal_info', 'student_fact', 'idea', 'reference']).optional(),
    tags: z.array(z.string()).optional(),
    importance: z.number().min(1).max(5).optional(),
  }),
});

export const noteGenerationSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Subject is required'),
    topic: z.string().min(1, 'Topic is required'),
    unit: z.string().optional(),
    university: z.string().optional(),
    semester: z.number().optional(),
    style: z.enum(['short', 'detailed', 'exam_oriented', 'beginner_friendly', 'revision']).optional(),
  }),
});

export const captureSchema = z.object({
  body: z.object({
    rawInput: z.string().min(1, 'Input content is required'),
    captureType: z.enum(['text', 'voice', 'link', 'image']).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});
