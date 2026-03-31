const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
app.get('/slots', async (req, res) => {
  try {
    const { court_id, date } = req.query;
    const result = await pool.query('SELECT start_time FROM bookings WHERE court_id=$1 AND date=$2 AND status=$3', [court_id, date, 'confirmed']);
    res.json({ booked: result.rows.map(r => r.start_time.slice(0,5)) });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
app.post('/bookings', async (req, res) => {
  try {
    const { court_id, user_id, username, date, start_time, end_time } = req.body;
    const result = await pool.query('INSERT INTO bookings (court_id,user_id,username,date,start_time,end_time) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [court_id,user_id,username,date,start_time,end_time]);
    res.json({ booking_id: result.rows[0].id, status: 'confirmed' });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
app.get('/bookings/me', async (req, res) => {
  try {
    const { user_id } = req.query;
    const result = await pool.query('SELECT * FROM bookings WHERE user_id=$1 ORDER BY date DESC', [user_id]);
    res.json(result.rows);
  } catch(err) { res.status(500).json({ error: err.message }); }
});
app.get('/', (req, res) => res.json({ status: 'ok' }));
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', function() { console.log('서버 실행 포트:' + PORT); });
