const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config/config');

exports.generateToken = (user) => {
  return jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '1h' });
};

exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

exports.comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Encryption utility functions for secure data storage
const algorithm = 'aes-256-cbc';
const secretKey = crypto.scryptSync(config.jwtSecret, 'salt', 32);

exports.encryptData = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex')
  };
};

exports.decryptData = (encryptedData) => {
  const { encrypted, iv } = encryptedData;
  
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
