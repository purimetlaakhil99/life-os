import { AcademicNote } from '../models/AcademicNote.js';
import { QuestionPaper } from '../models/QuestionPaper.js';
import { DigitalFile } from '../models/DigitalFile.js';
import { generateStructuredNotes, createNotesPDF } from '../services/notesGeneratorService.js';
import { analyzeQuestionPatterns, ensureDefaultQuestionPapers } from '../services/academicSearchService.js';
import { generateLLMCompletion } from '../services/llmProviderService.js';

export async function generateNotes(req, res, next) {
  try {
    const { subject, topic, unit, style, university } = req.body;
    const noteData = await generateStructuredNotes({ subject, topic, unit, style, university });

    const note = await AcademicNote.create({
      userId: req.userId,
      subject,
      topic,
      unit: unit || 'Unit 1',
      university: university || '',
      style: style || 'exam_oriented',
      sections: noteData.sections,
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

export async function getNotesList(req, res, next) {
  try {
    const { subject } = req.query;
    const filter = { userId: req.userId };
    if (subject) filter.subject = new RegExp(subject.trim(), 'i');

    const notes = await AcademicNote.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    next(err);
  }
}

export async function getNoteById(req, res, next) {
  try {
    const note = await AcademicNote.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ error: 'Academic note not found' });
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
}

export async function exportNotePDF(req, res, next) {
  try {
    const note = await AcademicNote.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ error: 'Academic note not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${note.subject}_${note.topic}.pdf"`);

    createNotesPDF(note, res);
  } catch (err) {
    next(err);
  }
}

export async function searchPapers(req, res, next) {
  try {
    await ensureDefaultQuestionPapers();

    const { subject, semester, year, university } = req.query;
    const filter = {};

    if (subject) filter.subject = new RegExp(subject.trim(), 'i');
    if (semester) filter.semester = Number(semester);
    if (year) filter.year = Number(year);
    if (university) filter.university = new RegExp(university.trim(), 'i');

    const papers = await QuestionPaper.find(filter).sort({ year: -1 });
    res.status(200).json(papers);
  } catch (err) {
    next(err);
  }
}

export async function analyzePapers(req, res, next) {
  try {
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject is required for pattern analysis' });

    const analysis = await analyzeQuestionPatterns(subject);
    res.status(200).json(analysis);
  } catch (err) {
    next(err);
  }
}

export async function uploadQuestionPaper(req, res, next) {
  try {
    const { university, course = 'B.Tech', branch = 'Computer Science', semester = 5, subject, year = new Date().getFullYear(), rawQuestionsText = '' } = req.body;
    if (!university || !subject) {
      return res.status(400).json({ error: 'University and subject are required' });
    }

    const lines = String(rawQuestionsText || '')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 8);

    const parsedQuestions = lines.map((line, idx) => ({
      questionText: line.replace(/^\d+[.)]\s*/, ''),
      unit: `Unit ${(idx % 5) + 1}`,
      marks: line.length > 70 ? 16 : 10,
      frequencyCount: 3,
      topics: [subject],
    }));

    const paper = await QuestionPaper.create({
      userId: req.userId,
      university,
      course,
      branch,
      semester: Number(semester),
      subject,
      year: Number(year),
      source: 'User Uploaded Question Paper',
      isUserUploaded: true,
      parsedQuestions,
    });

    res.status(201).json(paper);
  } catch (err) {
    next(err);
  }
}

export async function askStudyBuddy(req, res, next) {
  try {
    const { question, subject = 'Computer Science', topic = '' } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    // Retrieve user's uploaded study materials for contextual answers
    const studyDocs = await DigitalFile.find({
      userId: req.userId,
      category: { $in: ['study_material', 'question_paper'] },
    }).sort({ createdAt: -1 }).limit(3);

    const docContext = studyDocs
      .filter(d => d.extractedText)
      .map(d => `[Document: ${d.title}]\n${d.extractedText.slice(0, 1200)}`)
      .join('\n\n');

    let answer = await generateLLMCompletion({
      systemPrompt: `You are LIFE OS AI Study Buddy helping a university student with ${subject}. Give clear, exam-ready, step-by-step explanations. Distinguish verified uploaded document references from general explanations.`,
      userPrompt: `${docContext ? `Uploaded Study Context:\n${docContext}\n\n` : ''}Student Question (${topic || subject}): ${question}`,
    });

    if (!answer) {
      answer = `[Study Buddy Solution for ${subject}]\n\nQuestion: "${question}"${docContext ? `\n\nReferenced Uploaded Material: ${studyDocs.map(d => d.title).join(', ')}` : ''}\n\nCore Explanation:\nUnderstanding this concept requires examining the fundamental principles. In ${subject}, when dealing with ${topic || 'this topic'}, the primary mechanism relies on deterministic invariant handling and systematic transition steps.\n\nKey Step-by-Step Breakdown:\n1. Identify the input states, preconditions, and boundary constraints.\n2. Execute the state transitions adhering to standard algorithmic invariants.\n3. Validate the postcondition and verify asymptotic complexity bounds.\n\nExam Tip: When answering this in university exams, include the standard architectural flow diagram and cite at least two practical industrial use cases!`;
    }

    const flashcards = [
      { front: `What is the core definition of ${topic || question.slice(0, 30)}?`, back: `The verified standard mechanism in ${subject} ensuring operational correctness.` },
      { front: `What is the standard complexity / trade-off for this concept?`, back: `Balanced asymptotic bound with predictable memory overhead in production systems.` }
    ];

    const quiz = [
      {
        question: `Which foundational property is critical when solving "${topic || subject}" exam problems?`,
        options: ['Deterministic state invariants', 'Random memory allocation', 'Ignoring boundary inputs', 'Skipping synchronization'],
        correctIndex: 0,
      }
    ];

    res.status(200).json({
      answer,
      flashcards,
      quiz,
      referencedDocuments: studyDocs.map(d => d.title),
      suggestedNextTopic: 'Process Synchronization and Locking Protocols',
    });
  } catch (err) {
    next(err);
  }
}
