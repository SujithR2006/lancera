const mongoose = require('mongoose');

const SurgeryLogSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stepIndex: { type: Number, required: true },
  stepName: { type: String, required: true },
  action: { type: String, required: true },
  aiResponse: { type: String },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number }
});

module.exports = mongoose.model('SurgeryLog', SurgeryLogSchema);
