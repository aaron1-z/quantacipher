const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

/**
 * Generates a cryptographic key from a password using PBKDF2
 * @param {string} password - The password to derive key from
 * @param {string} salt - The salt for key derivation
 * @returns {Buffer} - The derived key
 */
const deriveKey = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
};

/**
 * Encrypts data using AES-256-CBC
 * @param {string} data - The data to encrypt
 * @param {string} password - The password to use for encryption
 * @returns {object} - Object containing encrypted data, IV, and salt
 */
exports.encryptData = (data, password) => {
  try {
    if (data === null || data === undefined || password === null || password === undefined || password === '') {
      throw new Error('Data and password are required');
    }

    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = deriveKey(password, salt);
    
    const cipher = crypto.createCipher(ALGORITHM, key);
    
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return {
      encrypted,
      iv: iv.toString('base64'),
      salt: salt.toString('base64')
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypts data using AES-256-CBC
 * @param {object} encryptedData - Object containing encrypted data, IV, and salt
 * @param {string} password - The password to use for decryption
 * @returns {string} - The decrypted data
 */
exports.decryptData = (encryptedData, password) => {
  try {
    if (!encryptedData || !password) {
      throw new Error('Encrypted data and password are required');
    }

    const { encrypted, iv, salt } = encryptedData;
    
    if (!encrypted || !iv || !salt) {
      throw new Error('Invalid encrypted data format');
    }

    const key = deriveKey(password, Buffer.from(salt, 'base64'));
    const decipher = crypto.createDecipher(ALGORITHM, key);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Generates a secure random password
 * @param {number} length - The length of the password to generate
 * @returns {string} - The generated password
 */
exports.generateSecurePassword = (length = 32) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};