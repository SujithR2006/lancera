const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  currentStep: { type: Number, default: 0 },
  completedSteps: [{ type: Number }],
  graftsPlaced: [{
    x: Number,
    y: Number,
    z: Number,
    stepIndex: Number
  }],
  vitalsLog: [{
    hr: Number,
    bp: String,
    spo2: Number,
    temp: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' }
});

module.exports = mongoose.model('Session', SessionSchema);
