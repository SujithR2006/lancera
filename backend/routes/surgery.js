const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../config/supabase');

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
    const { data: session, error } = await supabase.from('sessions').insert([{ 
      user_id: req.user.id,
      completed_steps: []
    }]).select().single();

    if (error) throw error;
    // Client might expect _id
    res.status(201).json({ sessionId: session.id, _id: session.id, session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/surgery/session/:sessionId
router.get('/session/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { data: session, error } = await supabase.from('sessions').select('*').eq('id', req.params.sessionId).single();
    if (error || !session) return res.status(404).json({ message: 'Session not found' });
    
    // Map db columns to frontend expectations
    session._id = session.id;
    session.currentStep = session.current_step;
    session.completedSteps = session.completed_steps || [];
    session.graftsPlaced = session.grafts_placed || [];
    session.vitalsLog = session.vitals_log || [];
    session.startTime = session.start_time;
    session.endTime = session.end_time;
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/surgery/session/:sessionId/step
router.patch('/session/:sessionId/step', authMiddleware, async (req, res) => {
  try {
    const { stepIndex, action } = req.body;
    const { data: session, error: getError } = await supabase.from('sessions').select('*').eq('id', req.params.sessionId).single();
    if (getError || !session) return res.status(404).json({ message: 'Session not found' });

    let completedSteps = session.completed_steps || [];
    if (!completedSteps.includes(stepIndex - 1) && stepIndex > 0) {
      completedSteps.push(stepIndex - 1);
    }
    const score = (completedSteps.length / 10) * 100;

    const { data: updatedSession, error: updateError } = await supabase.from('sessions').update({
      current_step: stepIndex,
      completed_steps: completedSteps,
      score: score
    }).eq('id', req.params.sessionId).select().single();

    if (updateError) throw updateError;

    // Log the action
    await supabase.from('surgery_logs').insert([{
      session_id: session.id,
      user_id: req.user.id,
      step_index: stepIndex,
      step_name: STEP_NAMES[stepIndex] || `Step ${stepIndex}`,
      action: action || 'step_advance'
    }]);

    updatedSession._id = updatedSession.id;
    updatedSession.currentStep = updatedSession.current_step;
    updatedSession.completedSteps = updatedSession.completed_steps;
    res.json(updatedSession);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/surgery/session/:sessionId/graft
router.post('/session/:sessionId/graft', authMiddleware, async (req, res) => {
  try {
    const { x, y, z, stepIndex } = req.body;
    const { data: session, error: getError } = await supabase.from('sessions').select('grafts_placed').eq('id', req.params.sessionId).single();
    if (getError || !session) return res.status(404).json({ message: 'Session not found' });

    const graftsPlaced = session.grafts_placed || [];
    graftsPlaced.push({ x, y, z, stepIndex });

    const { data: updatedSession, error: updateError } = await supabase.from('sessions').update({
      grafts_placed: graftsPlaced
    }).eq('id', req.params.sessionId).select('grafts_placed').single();

    if (updateError) throw updateError;

    res.json({ graftsPlaced: updatedSession.grafts_placed });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/surgery/sessions/history
router.get('/sessions/history', authMiddleware, async (req, res) => {
  try {
    const { data: sessions, error } = await supabase.from('sessions').select('*').eq('user_id', req.user.id).order('start_time', { ascending: false });
    if (error) throw error;
    
    // Map response
    const mappedSessions = sessions.map(s => {
      return {
        ...s,
        _id: s.id,
        currentStep: s.current_step,
        completedSteps: s.completed_steps,
        startTime: s.start_time,
        endTime: s.end_time
      }
    });
    res.json(mappedSessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/surgery/session/:sessionId/end
router.patch('/session/:sessionId/end', authMiddleware, async (req, res) => {
  try {
    const { data: session, error } = await supabase.from('sessions').update({
      end_time: new Date().toISOString(),
      status: 'completed'
    }).eq('id', req.params.sessionId).select().single();

    if (error) return res.status(404).json({ message: 'Session not found or error occurred' });

    session._id = session.id;
    session.endTime = session.end_time;
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
