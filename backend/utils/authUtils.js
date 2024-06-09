const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

exports.generateToken = (user) => {
  return jwt.sign({ id: user.id }, config.secretOrKey, { expiresIn: '1h' });
};

exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

exports.comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
