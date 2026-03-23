const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// GET /api/models/heart
router.get('/heart', (req, res) => {
  const glbPath = path.join(__dirname, '../../frontend/public/models/heart.glb');
  if (fs.existsSync(glbPath)) {
    res.json({ url: '/models/heart.glb', available: true });
  } else {
    res.json({ available: false, fallback: 'procedural' });
  }
});

module.exports = router;
