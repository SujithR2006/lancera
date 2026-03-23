const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const SurgeryLog = require('../models/SurgeryLog');

// Fallback guidance per step if Anthropic fails
const FALLBACK_GUIDANCE = [
  "Begin pre-operative assessment. Verify patient vitals, review imaging, confirm allergies and medications. Ensure informed consent is documented. WARNING: Confirm patient has been NPO for minimum 8 hours.",
  "Administer general anesthesia via endotracheal intubation. Insert arterial line for continuous BP monitoring. Place central venous catheter. WARNING: Monitor for hypotension during induction sequence.",
  "Perform median sternotomy with oscillating saw. Place sternal retractor for optimal exposure. Control bleeding with electrocautery. WARNING: Protect innominate vein during retractor placement.",
  "Cannulate ascending aorta and right atrium. Initiate cardiopulmonary bypass at 2.4L/min/m². Cool patient to 32°C moderate hypothermia. WARNING: Verify ACT >480 seconds before bypass initiation.",
  "Harvest left internal mammary artery or saphenous vein graft. Maintain hemostasis along conduit length. Spatulate graft end for anastomosis. WARNING: Preserve graft length — minimum 15cm required.",
  "Apply cross-clamp to ascending aorta distal to cannulation site. Deliver cold blood cardioplegia 1L antegrade. Verify cardiac arrest on ECG flat-line. WARNING: Cardioplegia must stop all electrical activity.",
  "Place bypass graft anastomosis sites. Begin with most critical vessel — LAD first. Use 7-0 prolene suture running technique. Click target sites on heart. WARNING: Avoid air embolism during open anastomosis.",
  "De-air cardiac chambers. Remove aortic cross-clamp. Warm patient to 37°C. Wean from cardiopulmonary bypass gradually. WARNING: Monitor for ventricular fibrillation on rewarming.",
  "Achieve meticulous hemostasis. Place mediastinal drainage tubes. Close sternum with stainless steel wires. Layer closure of fascia and subcutaneous tissue. WARNING: Ensure bilateral pleural drainage if violated.",
  "Transfer to cardiac ICU with continuous monitoring. Maintain MAP 65-85mmHg. Wean vasopressors per protocol. Extubate when hemodynamically stable. WARNING: Watch for post-op bleeding >200mL/hr."
];

const STEP_NAMES = [
  'Pre-operative Assessment', 'Anesthesia Induction', 'Sternotomy',
  'Cardiopulmonary Bypass Setup', 'Harvesting Graft Vessel', 'Aortic Clamping',
  'Performing Bypass Grafts', 'Removing Bypass Machine', 'Sternal Closure', 'Post-operative Care'
];

// POST /api/ai/guide
router.post('/guide', authMiddleware, async (req, res) => {
  try {
    const { stepIndex, stepName, action, sessionId } = req.body;
    const fallback = FALLBACK_GUIDANCE[stepIndex] || FALLBACK_GUIDANCE[0];

    // Check if Anthropic API key is set
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_key_here') {
      let warning = null;
      let guidance = fallback;
      if (fallback.includes('WARNING:')) {
        const parts = fallback.split('WARNING:');
        guidance = parts[0].trim();
        warning = parts[1].trim();
      }
      return res.json({ guidance, warning });
    }

    // Use Anthropic SDK dynamically
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: `You are ARIA — Assisted Reality Intelligence for Anatomy — an expert AI surgical guide embedded in LANCERA, a VR CABG surgery simulator. You speak with precision, urgency, and authority like a senior cardiothoracic surgeon guiding a trainee. Keep responses under 80 words. Use clinical terminology. Format: one short paragraph of instruction followed by a one-line WARNING if there is a critical risk at this step. Never use markdown.`,
      messages: [{
        role: 'user',
        content: `The surgeon is at step ${stepIndex + 1}: ${stepName || STEP_NAMES[stepIndex]}. Action: ${action || 'step_advance'}. Provide real-time guidance for this exact step in a CABG procedure.`
      }]
    });

    const text = message.content[0].text;
    let guidance = text;
    let warning = null;

    if (text.includes('WARNING:')) {
      const parts = text.split('WARNING:');
      guidance = parts[0].trim();
      warning = parts[1].trim();
    }

    // Log to DB
    if (sessionId) {
      try {
        await SurgeryLog.findOneAndUpdate(
          { sessionId, stepIndex },
          { aiResponse: text, timestamp: new Date() },
          { upsert: true }
        );
      } catch (_) {}
    }

    res.json({ guidance, warning });
  } catch (err) {
    console.error('AI Guide error:', err.message);
    // Return fallback on error
    const fallback = FALLBACK_GUIDANCE[req.body.stepIndex] || FALLBACK_GUIDANCE[0];
    let guidance = fallback;
    let warning = null;
    if (fallback.includes('WARNING:')) {
      const parts = fallback.split('WARNING:');
      guidance = parts[0].trim();
      warning = parts[1].trim();
    }
    res.json({ guidance, warning });
  }
});

module.exports = router;
