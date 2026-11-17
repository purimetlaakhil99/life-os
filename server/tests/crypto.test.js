import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, encryptToken, decryptToken } from '../src/utils/crypto.js';

describe('Security & Cryptography Utilities', () => {
  it('should hash a password and verify it successfully', async () => {
    const plain = 'StrongPassword123!';
    const hash = await hashPassword(plain);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(plain);

    const isValid = await verifyPassword(plain, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('should encrypt and decrypt OAuth refresh tokens using AES-256-GCM', () => {
    const sampleToken = '1//04_X9jFakeGoogleRefreshTokenExample12345';
    const cipherText = encryptToken(sampleToken);

    expect(cipherText).toBeDefined();
    expect(cipherText).not.toBe(sampleToken);
    expect(cipherText.split(':').length).toBe(3); // iv:authTag:encrypted

    const decrypted = decryptToken(cipherText);
    expect(decrypted).toBe(sampleToken);
  });
});
