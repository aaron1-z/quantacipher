// models/Data.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define your schema
const DataSchema = new Schema({
  key: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
});

// Create a model based on schema
const Data = mongoose.model('Data', DataSchema);

module.exports = Data;
