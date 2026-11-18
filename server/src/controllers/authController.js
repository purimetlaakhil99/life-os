import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { ENV } from '../config/env.js';

function generateToken(userId) {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, { expiresIn: '7d' });
}

function setTokenCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'student', preferredLanguage = 'en' } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      preferredLanguage,
    });

    // If student, initialize default profile
    if (role === 'student') {
      await StudentProfile.create({
        userId: user._id,
        university: 'National Institute of Technology',
        course: 'B.Tech',
        branch: 'Computer Science and Engineering',
        semester: 5,
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        settings: user.settings,
        googleConnected: user.googleAuth?.connected || false,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        settings: user.settings,
        googleConnected: user.googleAuth?.connected || false,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function demoLogin(req, res, next) {
  try {
    let user = await User.findOne({ email: 'akhilpurimetla@gmail.com' });
    if (!user) {
      user = await User.findOne({});
    }
    if (!user) {
      const passwordHash = await hashPassword('LifeOSDemo2026!');
      user = await User.create({
        name: 'AKHILBABU',
        email: 'akhilpurimetla@gmail.com',
        passwordHash,
        role: 'student',
        preferredLanguage: 'en',
      });
      await StudentProfile.create({
        userId: user._id,
        university: 'National Institute of Technology',
        course: 'B.Tech',
        branch: 'Computer Science and Engineering',
        semester: 5,
        attendanceTarget: 75,
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      message: 'Logged in as demo user',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        settings: user.settings,
        googleConnected: user.googleAuth?.connected || false,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  const user = req.user;
  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      settings: user.settings,
      googleConnected: user.googleAuth?.connected || false,
    },
  });
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}

export async function updateSettings(req, res, next) {
  try {
    const { preferredLanguage, voiceEnabled, autoSpeechOutput, attendanceTarget } = req.body;
    const user = req.user;

    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (typeof voiceEnabled === 'boolean') user.settings.voiceEnabled = voiceEnabled;
    if (typeof autoSpeechOutput === 'boolean') user.settings.autoSpeechOutput = autoSpeechOutput;
    if (typeof attendanceTarget === 'number') user.settings.attendanceTarget = attendanceTarget;

    await user.save();
    res.status(200).json({ message: 'Settings updated successfully', settings: user.settings, preferredLanguage: user.preferredLanguage });
  } catch (err) {
    next(err);
  }
}
