import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { DigitalFile } from '../models/DigitalFile.js';
import { AuditLog } from '../models/AuditLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_ROOT = process.env.VERCEL ? '/tmp/life-os-uploads' : path.resolve(__dirname, '../../uploads');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function sanitizeFilename(name) {
  return String(name || 'document.txt')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);
}

export async function listFiles(req, res, next) {
  try {
    const { category, search, subject } = req.query;
    const filter = { userId: req.userId };
    if (category) filter.category = category;
    if (subject) filter.subject = new RegExp(subject.trim(), 'i');
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: regex }, { originalName: regex }, { extractedText: regex }, { tags: regex }];
    }

    const files = await DigitalFile.find(filter)
      .select('-storedPath')
      .sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (err) {
    next(err);
  }
}

export async function uploadFile(req, res, next) {
  try {
    const { title, fileName, mimeType, contentBase64, textContent, category = 'personal_reference', subject = '', tags = [] } = req.body;

    if (!fileName || !mimeType) {
      return res.status(400).json({ error: 'fileName and mimeType are required' });
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      await AuditLog.create({
        userId: req.userId,
        action: 'file_upload_blocked',
        resource: fileName,
        status: 'denied',
        metadata: { mimeType },
      });
      return res.status(400).json({ error: `Unsupported file type: ${mimeType}. Allowed: PDF, TXT, MD, PNG, JPG.` });
    }

    let buffer;
    let extractedText = '';

    if (contentBase64) {
      const cleaned = String(contentBase64).replace(/^data:[^;]+;base64,/, '');
      buffer = Buffer.from(cleaned, 'base64');
      if (mimeType.startsWith('text/')) {
        extractedText = buffer.toString('utf8').slice(0, 15000);
      }
    } else if (typeof textContent === 'string') {
      buffer = Buffer.from(textContent, 'utf8');
      extractedText = textContent.slice(0, 15000);
    } else {
      return res.status(400).json({ error: 'Either contentBase64 or textContent must be provided' });
    }

    if (buffer.length === 0 || buffer.length > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({ error: 'File size must be between 1 byte and 5 MB' });
    }

    const safeOriginal = sanitizeFilename(fileName);
    const userDir = path.join(UPLOADS_ROOT, String(req.userId));
    await fs.mkdir(userDir, { recursive: true });

    const uniqueName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}_${safeOriginal}`;
    const storedPath = path.join(userDir, uniqueName);
    await fs.writeFile(storedPath, buffer);

    const record = await DigitalFile.create({
      userId: req.userId,
      title: title || safeOriginal,
      originalName: safeOriginal,
      storedPath,
      mimeType,
      sizeBytes: buffer.length,
      category,
      subject,
      extractedText: extractedText || (textContent ? String(textContent).slice(0, 15000) : ''),
      tags: Array.isArray(tags) ? tags : [],
    });

    await AuditLog.create({
      userId: req.userId,
      action: 'file_uploaded',
      resource: String(record._id),
      status: 'success',
      metadata: { category, sizeBytes: buffer.length, mimeType },
    });

    const sanitizedResponse = record.toObject();
    delete sanitizedResponse.storedPath;
    res.status(201).json(sanitizedResponse);
  } catch (err) {
    next(err);
  }
}

export async function downloadFile(req, res, next) {
  try {
    const file = await DigitalFile.findOne({ _id: req.params.id, userId: req.userId });
    if (!file) return res.status(404).json({ error: 'File not found or access denied' });

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    const data = await fs.readFile(file.storedPath);
    res.send(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteFile(req, res, next) {
  try {
    const file = await DigitalFile.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!file) return res.status(404).json({ error: 'File not found' });

    await fs.unlink(file.storedPath).catch(() => {});
    await AuditLog.create({
      userId: req.userId,
      action: 'file_deleted',
      resource: String(file._id),
      status: 'success',
    });

    res.status(200).json({ message: 'File deleted securely' });
  } catch (err) {
    next(err);
  }
}
