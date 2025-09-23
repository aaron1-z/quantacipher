// encryptionUtils.js - Secure AES-256-CBC encryption utilities for sensitive data storage
// WARNING: The encryption key must be kept secure and never exposed in logs or API responses

const crypto = require('crypto');

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

// Load encryption key from environment variable
// WARNING: In production, ensure ENCRYPTION_SECRET_KEY is set to a strong 32-byte key
const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET_KEY || 
  'default-dev-key-32chars-please-change-in-production!'; // 48 chars, will be hashed to 32

// Ensure we have a proper 32-byte key
const getEncryptionKey = () => {
  if (ENCRYPTION_KEY === 'default-dev-key-32chars-please-change-in-production!') {
    console.warn('WARNING: Using default encryption key. Set ENCRYPTION_SECRET_KEY environment variable for production!');
  }
  // Use SHA-256 to ensure we have exactly 32 bytes regardless of input length
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
};

/**
 * Encrypts sensitive data using AES-256-CBC
 * @param {string} text - The plaintext to encrypt
 * @returns {string} - The encrypted data in format: iv:encryptedData (both hex encoded)
 * @throws {Error} - If encryption fails
 */
const encryptData = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Text to encrypt must be a non-empty string');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV and encrypted data separated by colon
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error('Failed to encrypt data: ' + error.message);
  }
};

/**
 * Decrypts data that was encrypted with encryptData
 * @param {string} encryptedData - The encrypted data in format: iv:encryptedData (both hex encoded)
 * @returns {string} - The decrypted plaintext
 * @throws {Error} - If decryption fails
 */
const decryptData = (encryptedData) => {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Encrypted data must be a non-empty string');
    }

    const textParts = encryptedData.split(':');
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const key = getEncryptionKey();
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = textParts[1];
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt data: ' + error.message);
  }
};

module.exports = {
  encryptData,
  decryptData
};