// LIFE OS Gmail Integration Service (Official Google OAuth 2.0 & Gmail API)
import { google } from 'googleapis';
import { ENV } from '../config/env.js';
import { decryptToken } from '../utils/crypto.js';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar.events'
];

/**
 * Create an OAuth2 client instance
 */
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    ENV.GOOGLE_CLIENT_ID || 'dummy_client_id',
    ENV.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    ENV.GOOGLE_REDIRECT_URI
  );
}

/**
 * Generate Google OAuth authorization URL with minimum required scopes
 */
export function generateAuthUrl() {
  const oAuth2Client = getOAuth2Client();
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline', // ensures we receive a refresh token
    prompt: 'consent',     // forces consent to obtain new refresh token
    scope: SCOPES,
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code) {
  const oAuth2Client = getOAuth2Client();
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
}

/**
 * Compose RFC 2822 MIME base64url email string
 */
function createMimeMessage({ to, from, subject, message }) {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    message,
  ];
  const email = messageParts.join('\r\n');
  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send an email using official Gmail API with user's stored OAuth credentials
 * @param {Object} options
 * @param {string} options.encryptedRefreshToken
 * @param {string} options.to
 * @param {string} options.from
 * @param {string} options.subject
 * @param {string} options.body
 */
export async function sendGmailMessage({ encryptedRefreshToken, to, from, subject, body }) {
  if (!encryptedRefreshToken) {
    throw new Error('User has not connected a Gmail account or refresh token is missing.');
  }

  const refreshToken = decryptToken(encryptedRefreshToken);
  if (!refreshToken) {
    throw new Error('Failed to decrypt stored Google OAuth refresh token.');
  }

  const oAuth2Client = getOAuth2Client();
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  const raw = createMimeMessage({ to, from: from || 'me', subject, message: body });

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    return {
      success: true,
      messageId: res.data.id,
      threadId: res.data.threadId,
      disclaimer: 'Message accepted by Gmail API for dispatch. Standard inbox delivery depends on recipient mailbox provider.',
    };
  } catch (err) {
    console.error('[GmailService] Error sending email:', err.message);
    throw new Error(`Gmail API dispatch error: ${err.message}`);
  }
}
