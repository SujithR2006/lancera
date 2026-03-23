const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log('✅ Connected!'); process.exit(0); })
  .catch(e => { console.log('❌ Error:', e.message); process.exit(1); });
