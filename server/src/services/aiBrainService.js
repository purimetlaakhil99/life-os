// LIFE OS Central AI Brain & Tool Dispatcher
import { Memory } from '../models/Memory.js';
import { Task } from '../models/Task.js';
import { Event } from '../models/Event.js';
import { Contact } from '../models/Contact.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { DigitalFile } from '../models/DigitalFile.js';
import { calculateAttendanceStats } from './attendanceService.js';
import { generateStructuredNotes } from './notesGeneratorService.js';
import { analyzeQuestionPatterns } from './academicSearchService.js';
import { generateLLMCompletion } from './llmProviderService.js';
import crypto from 'crypto';

// In-memory cache for pending sensitive action confirmation tokens
const pendingActionTokens = new Map();

/**
 * Clean expired confirmation tokens periodically
 */
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [token, data] of pendingActionTokens.entries()) {
    if (now > data.expiresAt) {
      pendingActionTokens.delete(token);
    }
  }
}, 60000);
if (cleanupTimer.unref) cleanupTimer.unref();

export const AUTHORIZED_TOOLS = {
  // 1. Task Creation Tool
  create_task: {
    name: 'create_task',
    description: 'Create a new task, to-do item, or reminder for the user',
    isSensitive: false,
    execute: async (params, userId) => {
      const { title, priority = 'medium', dueDate, category = 'personal', description = '' } = params;
      const task = await Task.create({
        userId,
        title,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        category,
        description,
        status: 'pending'
      });
      return {
        action: 'create_task',
        success: true,
        task: { id: task._id, title: task.title, priority: task.priority, dueDate: task.dueDate }
      };
    }
  },

  // 2. Calendar Event Creation Tool
  create_calendar_event: {
    name: 'create_calendar_event',
    description: 'Schedule a calendar event, class, or focus session',
    isSensitive: false,
    execute: async (params, userId) => {
      const { title, startTime, endTime, category = 'personal', location = '' } = params;
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : new Date(start.getTime() + 60 * 60 * 1000);

      // Conflict detection check
      const conflict = await Event.findOne({
        userId,
        $or: [
          { startTime: { $lt: end }, endTime: { $gt: start } }
        ]
      });

      const event = await Event.create({
        userId,
        title,
        startTime: start,
        endTime: end,
        category,
        location
      });

      return {
        action: 'create_calendar_event',
        success: true,
        event: { id: event._id, title: event.title, startTime: event.startTime, endTime: event.endTime },
        conflictWarning: conflict ? `Notice: overlaps with existing event "${conflict.title}"` : null
      };
    }
  },

  // 3. Search Personal Memory Tool
  search_personal_memory: {
    name: 'search_personal_memory',
    description: 'Search private personal memory store for user preferences, routines, and facts',
    isSensitive: false,
    execute: async (params, userId) => {
      const { query } = params;
      const regex = new RegExp(query.trim(), 'i');
      const memories = await Memory.find({
        userId,
        $or: [{ title: regex }, { content: regex }, { tags: regex }]
      }).limit(5).select('title content category importance');

      return {
        action: 'search_personal_memory',
        results: memories
      };
    }
  },

  // 4. Save Personal Memory Tool
  save_personal_memory: {
    name: 'save_personal_memory',
    description: 'Save a verified user preference, routine, relationship or fact into private memory',
    isSensitive: false,
    execute: async (params, userId) => {
      const { title, content, category = 'personal_info', importance = 3 } = params;
      const memory = await Memory.create({
        userId,
        title,
        content,
        category,
        importance,
        source: 'chat_extracted'
      });
      return {
        action: 'save_personal_memory',
        success: true,
        memory: { id: memory._id, title: memory.title }
      };
    }
  },

  // 5. Attendance Intelligence Tool
  check_attendance_status: {
    name: 'check_attendance_status',
    description: 'Check attendance percentage and margin calculations for a university subject',
    isSensitive: false,
    execute: async (params, userId) => {
      const { subject } = params;
      let query = { userId };
      if (subject) {
        query.subjectName = new RegExp(subject.trim(), 'i');
      }

      const records = await AttendanceRecord.find(query);
      const reports = records.map(r => ({
        subject: r.subjectName,
        ...calculateAttendanceStats(r.attendedClasses, r.totalClasses, r.targetPercentage)
      }));

      return {
        action: 'check_attendance_status',
        reports
      };
    }
  },

  // 6. Generate Academic Notes Tool
  generate_academic_notes: {
    name: 'generate_academic_notes',
    description: 'Generate 12-section structured academic notes on any topic',
    isSensitive: false,
    execute: async (params) => {
      const { subject, topic, unit, style } = params;
      const notes = await generateStructuredNotes({ subject, topic, unit, style });
      return {
        action: 'generate_academic_notes',
        subject: notes.subject,
        topic: notes.topic,
        preview: notes.sections.shortRevisionNotes,
        examBlueprint: notes.sections.longAnswerExamPrep
      };
    }
  },

  // 7. Question Paper Intelligence Tool
  analyze_exam_questions: {
    name: 'analyze_exam_questions',
    description: 'Analyze previous exam questions and repeated patterns for a subject',
    isSensitive: false,
    execute: async (params) => {
      const { subject } = params;
      const intelligence = await analyzeQuestionPatterns(subject || 'Database Management Systems');
      return {
        action: 'analyze_exam_questions',
        intelligence
      };
    }
  },

  // 8. Compose Birthday Wish Tool (EN, HI, TE)
  compose_birthday_wish: {
    name: 'compose_birthday_wish',
    description: 'Generate a personalized birthday wish in English, Hindi, or Telugu',
    isSensitive: false,
    execute: async (params) => {
      const { name, language = 'en', style = 'heartfelt', notes = '' } = params;
      const wish = generateBirthdayMessage({ name, language, style, notes });
      return {
        action: 'compose_birthday_wish',
        language,
        style,
        recipient: name,
        message: wish
      };
    }
  },

  // 9. Sensitive Action: Schedule Automatic Birthday Dispatch
  schedule_birthday_email: {
    name: 'schedule_birthday_email',
    description: 'Enable automated yearly birthday email dispatch through Gmail',
    isSensitive: true,
    execute: async (params, userId) => {
      const { contactId, sendTime = '09:00', approvedMessage } = params;
      const contact = await Contact.findOne({ _id: contactId, userId });
      if (!contact) {
        throw new Error('Contact not found or access denied');
      }

      contact.autoBirthdayEmail = true;
      contact.birthdaySendTime = sendTime;
      if (approvedMessage) contact.approvedCustomMessage = approvedMessage;
      await contact.save();

      return {
        action: 'schedule_birthday_email',
        success: true,
        contact: { id: contact._id, name: contact.name, birthdaySendTime: contact.birthdaySendTime }
      };
    }
  },

  // 10. Search Uploaded Digital Files Tool
  search_digital_files: {
    name: 'search_digital_files',
    description: 'Search user uploaded documents, study materials, and personal references',
    isSensitive: false,
    execute: async (params, userId) => {
      const { query = '' } = params;
      const filter = { userId };
      if (query.trim()) {
        const regex = new RegExp(query.trim(), 'i');
        filter.$or = [{ title: regex }, { originalName: regex }, { extractedText: regex }, { subject: regex }];
      }
      const files = await DigitalFile.find(filter).limit(5).select('title originalName category subject createdAt');
      return {
        action: 'search_digital_files',
        results: files,
      };
    }
  }
};

/**
 * Generate birthday wish in English, Hindi, or Telugu
 */
export function generateBirthdayMessage({ name, language = 'en', style = 'heartfelt', notes = '' }) {
  const wishes = {
    en: {
      friendly: `Happy Birthday, ${name}! 🎉 Hope you have an awesome day filled with fun and laughter!`,
      heartfelt: `Dearest ${name}, wishing you a truly joyful and blessed birthday. May this upcoming year bring you immense happiness, peace, and fulfillment in everything you do! 🎂✨`,
      emotional: `Happy Birthday ${name}. You hold such a special place in my life, and I am endlessly grateful for your warmth and presence. Wishing you the happiest of days! ❤️`,
      funny: `Happy Birthday ${name}! You're not getting older, just leveling up! 🎮 Have a blast today!`,
      simple: `Wishing you a very Happy Birthday, ${name}! Have a wonderful day ahead!`,
      personalized: `Happy Birthday ${name}! ${notes ? `Remembering all our great moments: ${notes}. ` : ''}Wishing you great success and happiness!`
    },
    hi: {
      friendly: `जन्मदिन की बहुत-बहुत शुभकामनाएं, ${name}! 🎉 आपका दिन मंगलमय और खुशियों से भरा हो!`,
      heartfelt: `प्रिय ${name}, आपको जन्मदिन की हार्दिक शुभकामनाएं। ईश्वर आपको उत्तम स्वास्थ्य, सफलता और खुशियां प्रदान करें! 🎂✨`,
      emotional: `जन्मदिन मुबारक हो ${name}। आप हमारे जीवन में बहुत अनमोल हैं, ईश्वर आपके जीवन को सदा खुशियों से आलोकित रखे। ❤️`,
      funny: `हैप्पी बर्थडे ${name}! उम्र बढ़ रही है लेकिन दिल हमेशा जवान रहे! पार्टी कब दे रहे हो? 🥳`,
      simple: `जन्मदिन की ढेर सारी शुभकामनाएं, ${name}! आपका दिन शुभ हो!`,
      personalized: `प्रिय ${name}, जन्मदिन मुबारक! ${notes ? `${notes}। ` : ''}सदा मुस्कुराते और आगे बढ़ते रहें!`
    },
    te: {
      friendly: `పుట్టినరోజు శుభాకాంక్షలు, ${name}! 🎉 ఈ రోజు ఎంతో ఆనందంగా గడవాలని కోరుకుంటున్నాను!`,
      heartfelt: `ప్రియమైన ${name} గారికి హృదయపూర్వక జన్మదిన శుభాకాంక్షలు! 🎂 మీ జీవితంలో సంతోషం, విజయం, ఆయురారోగ్యాలు నిండాలని మనస్ఫూర్తిగా కోరుకుంటున్నాను. ✨`,
      emotional: `హృదయపూర్వక పుట్టినరోజు శుభాకాంక్షలు ${name}. మా జీవితంలో మీ స్థానం ఎంతో ప్రత్యేకం. దేవుడు మిమ్మల్ని ఎల్లప్పుడూ చల్లగా చూడాలి. ❤️`,
      funny: `హ్యాపీ బర్త్‌డే ${name}! వయసు పెరుగుతున్నా ఉత్సాహం మాత్రం తగ్గట్లేదు! పార్టీ ఎక్కడ మరి? 🍰`,
      simple: `మీకు జన్మదిన శుభాకాంక్షలు, ${name}! ఈ రోజు చాలా బాగుండాలని ఆశిస్తున్నాను.`,
      personalized: `ప్రియమైన ${name}, పుట్టినరోజు శుభాకాంక్షలు! ${notes ? `${notes}. ` : ''}ఎల్లప్పుడూ సంతోషంగా ఉండాలని ఆకాంక్షిస్తున్నాను!`
    }
  };

  const langKey = wishes[language] ? language : 'en';
  const styleKey = wishes[langKey][style] ? style : 'heartfelt';
  return wishes[langKey][styleKey];
}

/**
 * Preview a sensitive action and return confirmation token
 */
export function createActionPreview(actionName, params, userId) {
  const tool = AUTHORIZED_TOOLS[actionName];
  if (!tool) throw new Error(`Unknown tool action: ${actionName}`);

  const actionToken = crypto.randomBytes(24).toString('hex');
  const previewData = {
    actionName,
    params,
    userId,
    isSensitive: tool.isSensitive,
    summary: `Authorize action "${actionName}" with parameters: ${JSON.stringify(params)}`,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  };

  pendingActionTokens.set(actionToken, previewData);

  return {
    actionToken,
    preview: previewData.summary,
    requiresConfirmation: tool.isSensitive
  };
}

/**
 * Confirm and execute a sensitive action using token
 */
export async function executeConfirmedAction(actionToken, userId) {
  const data = pendingActionTokens.get(actionToken);
  if (!data) {
    throw new Error('Action confirmation token is invalid or has expired.');
  }

  if (String(data.userId) !== String(userId)) {
    throw new Error('Unauthorized action confirmation.');
  }

  const tool = AUTHORIZED_TOOLS[data.actionName];
  const result = await tool.execute(data.params, userId);
  pendingActionTokens.delete(actionToken);
  return result;
}

/**
 * Main Central AI Brain Dispatcher
 * Parses natural language input, retrieves memory, triggers authorized tools, and builds response.
 */
export async function processAIChat({ message, userId, language = 'en', mode = 'chat', studentContext = null }) {
  const text = String(message || '').trim();
  const lower = text.toLowerCase();

  // 1. Personal Memory Retrieval
  const userMemories = await Memory.find({ userId }).sort({ importance: -1 }).limit(4);
  const memoryContext = userMemories.map(m => `[Memory: ${m.title}] ${m.content}`).join('\n');

  const executedActions = [];
  let aiReply = '';
  let audioText = '';

  // 2. Intent Recognition & Tool Dispatching
  // A. Task Creation Intent
  if (/remind me to|create a task|add to-do|todo:|add task/i.test(lower)) {
    const title = text.replace(/^(remind me to|create a task|add to-do|todo:|add task)\s*/i, '').trim();
    if (title) {
      const taskRes = await AUTHORIZED_TOOLS.create_task.execute({ title, priority: lower.includes('urgent') ? 'urgent' : 'medium' }, userId);
      executedActions.push(taskRes);
      aiReply = `I've created the task: "${title}". It has been added to your My Day list.`;
    }
  }
  // B. Attendance Check Intent
  else if (/attendance|how many classes|can i miss|bunk/i.test(lower)) {
    const attRes = await AUTHORIZED_TOOLS.check_attendance_status.execute({}, userId);
    executedActions.push(attRes);
    if (attRes.reports.length > 0) {
      const summary = attRes.reports.map(r => `${r.subject}: ${r.percentage}% (${r.statusLabel})`).join(', ');
      aiReply = `Here is your current attendance summary: ${summary}. Let me know if you want detailed margin calculations!`;
    } else {
      aiReply = `You haven't logged any attendance records yet. Head over to Student Life -> Attendance Intelligence to add your subjects!`;
    }
  }
  // C. Academic Notes Generation Intent
  else if (/notes on|generate notes|explain topic|revision notes for/i.test(lower)) {
    const topicMatch = text.match(/(?:notes on|generate notes for|explain topic|revision notes for)\s+([^?.!]+)/i);
    const topic = topicMatch ? topicMatch[1].trim() : 'Computer Architecture';
    const notesRes = await AUTHORIZED_TOOLS.generate_academic_notes.execute({ subject: 'Computer Science', topic, style: 'exam_oriented' }, userId);
    executedActions.push(notesRes);
    aiReply = `I've generated structured 12-section academic notes for "${topic}". Here is a quick revision summary:\n\n${notesRes.preview}\n\nExam Blueprint:\n${notesRes.examBlueprint}`;
  }
  // D. Exam Paper Intelligence Intent
  else if (/previous papers|exam pattern|repeated questions|repeated topics/i.test(lower)) {
    const subMatch = text.match(/(?:for|in)\s+([^?.!]+)/i);
    const sub = subMatch ? subMatch[1].trim() : 'Database Management Systems';
    const examRes = await AUTHORIZED_TOOLS.analyze_exam_questions.execute({ subject: sub }, userId);
    executedActions.push(examRes);
    const topQuestions = examRes.intelligence.repeatedQuestions.slice(0, 2).map(q => `• "${q.questionText}" (${q.appearances} appearances)`).join('\n');
    aiReply = `Analysis of previous exam papers for ${sub}:\n${topQuestions}\n\nTop Yield Unit: ${examRes.intelligence.importantUnits[0]?.unit || 'Unit 3'}.`;
  }
  // E. Birthday Wish Intent
  else if (/birthday wish|wish birthday|happy birthday to/i.test(lower)) {
    const nameMatch = text.match(/(?:for|to)\s+([A-Za-z]+)/i);
    const name = nameMatch ? nameMatch[1] : 'Friend';
    const wishLang = /hindi/i.test(lower) ? 'hi' : (/telugu/i.test(lower) ? 'te' : language);
    const wishRes = await AUTHORIZED_TOOLS.compose_birthday_wish.execute({ name, language: wishLang, style: 'heartfelt' }, userId);
    executedActions.push(wishRes);
    aiReply = `Here is a personalized birthday wish for ${name}:\n\n"${wishRes.message}"`;
  }
  // F. Schedule Calendar Intent
  else if (/schedule|calendar|set meeting/i.test(lower)) {
    const titleMatch = text.replace(/^(schedule|calendar|set meeting)\s*/i, '').trim() || 'Focus Session';
    const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const eventRes = await AUTHORIZED_TOOLS.create_calendar_event.execute({ title: titleMatch, startTime }, userId);
    executedActions.push(eventRes);
    aiReply = `I've scheduled "${titleMatch}" for ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. ${eventRes.conflictWarning || ''}`;
  }
  // F2. File & Document Search Intent
  else if (/find file|search file|my document|uploaded notes|my files/i.test(lower)) {
    const query = text.replace(/^(find file|search file|my document|uploaded notes|my files)\s*(for|about)?\s*/i, '').trim();
    const fileRes = await AUTHORIZED_TOOLS.search_digital_files.execute({ query }, userId);
    executedActions.push(fileRes);
    if (fileRes.results.length > 0) {
      const list = fileRes.results.map(f => `• ${f.title} (${f.category})`).join('\n');
      aiReply = `Here are the matching files from your private Digital Vault:\n${list}`;
    } else {
      aiReply = `No uploaded documents matched "${query || 'your query'}". You can upload files securely in My Memory -> Digital Vault or Student Life.`;
    }
  }
  // G. Conversational QA & General Life Intelligence (uses configured LLM if available)
  else {
    const llmText = await generateLLMCompletion({
      systemPrompt: `You are LIFE OS, a helpful personal and student life AI assistant. Respond in language code "${language}" (en=English, hi=Hindi, te=Telugu). Use the user's private memories when relevant:\n${memoryContext || 'No memories yet.'}`,
      userPrompt: text,
    });

    if (llmText) {
      aiReply = llmText;
    } else if (language === 'hi') {
      aiReply = `नमस्ते! मैं आपका LIFE OS AI सहायक हूँ। मैं आपके दैनिक कार्यों, समय सारिणी, उपस्थिति, और शैक्षणिक नोट्स की तैयारी में पूरी मदद कर सकता हूँ। आप क्या करना चाहते हैं?`;
    } else if (language === 'te') {
      aiReply = `నమస్కారం! నేను మీ LIFE OS AI అసిస్టెంట్‌ని. మీ దినచర్య పనులు, టైమ్‌టేబుల్, అటెండెన్స్ వివరాలు మరియు అకడమిక్ నోట్స్ తయారీలో నేను మీకు సహాయం చేయగలను. మీరు ఏమి చేయాలనుకుంటున్నారు?`;
    } else {
      aiReply = `Hello! I am your LIFE OS Assistant. I have your personal schedule, tasks, student timetable, and memory context ready. How can I help you today?`;
    }
  }

  // Spoken text adaptation for multilingual voice
  audioText = aiReply.replace(/[•*\n]/g, ' ').slice(0, 200);

  return {
    reply: aiReply,
    audioText,
    language,
    mode,
    executedActions,
    memoryRetrieved: userMemories.length > 0 ? userMemories.map(m => m.title) : [],
    suggestedQuickReplies: [
      'Check my attendance margin',
      'Generate notes for Operating Systems',
      'What are my pending tasks today?',
      'Analyze repeated exam questions'
    ]
  };
}
