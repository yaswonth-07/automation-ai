import crypto from 'crypto';
import { ENV } from './env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getKey(salt) {
  return crypto.pbkdf2Sync(ENV.CREDENTIAL_ENCRYPTION_KEY, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive credentials (tokens, secrets) using AES-256-GCM
 */
export function encryptCredentials(plainText) {
  if (!plainText) return '';
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey(salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(typeof plainText === 'object' ? JSON.stringify(plainText) : String(plainText), 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypt sensitive credentials using AES-256-GCM
 */
export function decryptCredentials(encryptedBase64) {
  if (!encryptedBase64) return null;
  try {
    const buffer = Buffer.from(encryptedBase64, 'base64');
    
    if (buffer.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH) {
      return null;
    }

    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = getKey(salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]).toString('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error('Credential decryption failed:', error.message);
    return null;
  }
}
