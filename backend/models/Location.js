const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId: String,
  latitude: Number,
  longitude: Number,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Location', locationSchema);
