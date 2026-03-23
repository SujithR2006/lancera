const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Session = require('../models/Session');
const SurgeryLog = require('../models/SurgeryLog');

const STEP_NAMES = [
  'Pre-operative Assessment',
  'Anesthesia Induction',
  'Sternotomy',
  'Cardiopulmonary Bypass Setup',
  'Harvesting Graft Vessel',
  'Aortic Clamping',
  'Performing Bypass Grafts',
  'Removing Bypass Machine',
  'Sternal Closure',
  'Post-operative Care'
];

// POST /api/surgery/session/start
router.post('/session/start', authMiddleware, async (req, res) => {
  try {
    const session = new Session({ userId: req.user.id });
    await session.save();
    res.status(201).json({ sessionId: session._id, session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/surgery/session/:sessionId
router.get('/session/:sessionId', authMiddleware, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/surgery/session/:sessionId/step
router.patch('/session/:sessionId/step', authMiddleware, async (req, res) => {
  try {
    const { stepIndex, action } = req.body;
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.currentStep = stepIndex;
    if (!session.completedSteps.includes(stepIndex - 1) && stepIndex > 0) {
      session.completedSteps.push(stepIndex - 1);
    }
    session.score = (session.completedSteps.length / 10) * 100;
    await session.save();

    // Log the action
    const log = new SurgeryLog({
      sessionId: session._id,
      userId: req.user.id,
      stepIndex,
      stepName: STEP_NAMES[stepIndex] || `Step ${stepIndex}`,
      action: action || 'step_advance',
      timestamp: new Date()
    });
    await log.save();

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/surgery/session/:sessionId/graft
router.post('/session/:sessionId/graft', authMiddleware, async (req, res) => {
  try {
    const { x, y, z, stepIndex } = req.body;
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.graftsPlaced.push({ x, y, z, stepIndex });
    await session.save();

    res.json({ graftsPlaced: session.graftsPlaced });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/surgery/sessions/history
router.get('/sessions/history', authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/surgery/session/:sessionId/end
router.patch('/session/:sessionId/end', authMiddleware, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.endTime = new Date();
    session.status = 'completed';
    await session.save();

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
