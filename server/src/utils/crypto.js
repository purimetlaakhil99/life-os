import crypto from 'crypto';
import { ENV } from '../config/env.js';

let argon2Module = null;
try {
  argon2Module = await import('argon2');
} catch (e) {
  console.warn('[Crypto] Native argon2 not available, falling back to secure scrypt PBKDF');
}

/**
 * Hash password using Argon2id or secure scrypt fallback
 */
export async function hashPassword(password) {
  if (argon2Module && argon2Module.hash) {
    try {
      return await argon2Module.hash(password, {
        type: argon2Module.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1
      });
    } catch (err) {
      console.warn('[Crypto] argon2 failed, using scrypt fallback:', err.message);
    }
  }

  // Cryptographically robust scrypt fallback
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password, hash) {
  if (!hash || !password) return false;

  if (hash.startsWith('$argon2') && argon2Module && argon2Module.verify) {
    try {
      return await argon2Module.verify(hash, password);
    } catch (err) {
      console.warn('[Crypto] argon2 verify failed:', err.message);
      return false;
    }
  }

  if (hash.startsWith('scrypt:')) {
    const [, salt, key] = hash.split(':');
    return new Promise((resolve) => {
      crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) return resolve(false);
        const keyBuffer = Buffer.from(key, 'hex');
        resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
      });
    });
  }

  return false;
}

function getEncryptionKeyBuffer() {
  return crypto.createHash('sha256').update(String(ENV.TOKEN_ENCRYPTION_KEY || 'life_os_default_key')).digest();
}

/**
 * Encrypt sensitive tokens (e.g. Google OAuth refresh tokens) using AES-256-GCM
 */
export function encryptToken(plainText) {
  if (!plainText) return null;
  const key = getEncryptionKeyBuffer();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt sensitive tokens using AES-256-GCM
 */
export function decryptToken(cipherText) {
  if (!cipherText) return null;
  const parts = cipherText.split(':');
  if (parts.length !== 3) return null;

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKeyBuffer();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
