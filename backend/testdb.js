require('dotenv').config();
const supabase = require('./config/supabase');

async function testConnection() {
    try {
        console.log("Testing connection and querying 'users' table in Supabase...");
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error('Error connecting to Supabase database:', error.message);
        } else {
            console.log('✅ Successfully connected to Supabase.');
            if (data.length === 0) {
              console.log('No users found in database, but connection works.');
            } else {
              console.log(`Queried successfully! Found ${data.length} user(s).`);
            }
        }
    } catch (err) {
        console.error('Connection error:', err);
    }
}

testConnection();
