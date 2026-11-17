import { generateAuthUrl, exchangeCodeForTokens } from '../services/gmailService.js';
import { encryptToken } from '../utils/crypto.js';
import { User } from '../models/User.js';
import { ENV } from '../config/env.js';

export async function getAuthUrl(req, res, next) {
  try {
    const url = generateAuthUrl();
    res.status(200).json({ url });
  } catch (err) {
    next(err);
  }
}

export async function handleCallback(req, res, next) {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).send('Authorization code missing');
    }

    const tokens = await exchangeCodeForTokens(code);

    if (tokens.refresh_token) {
      const encrypted = encryptToken(tokens.refresh_token);
      await User.findByIdAndUpdate(req.userId || state, {
        'googleAuth.connected': true,
        'googleAuth.encryptedRefreshToken': encrypted,
        'googleAuth.gmailSendAuthorized': true,
        'googleAuth.expiryDate': tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      });
    }

    res.redirect(`${ENV.CLIENT_URL}/settings?google=connected`);
  } catch (err) {
    console.error('[GoogleCallback] Error exchanging code:', err);
    res.redirect(`${ENV.CLIENT_URL}/settings?google=error`);
  }
}

export async function getGoogleStatus(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({
      connected: Boolean(user?.googleAuth?.connected),
      gmailSendAuthorized: Boolean(user?.googleAuth?.gmailSendAuthorized),
    });
  } catch (err) {
    next(err);
  }
}

export async function disconnectGoogle(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.userId, {
      googleAuth: {
        connected: false,
        encryptedRefreshToken: null,
        gmailSendAuthorized: false,
        expiryDate: null,
      },
    });
    res.status(200).json({ message: 'Google account disconnected successfully.' });
  } catch (err) {
    next(err);
  }
}
