const express = require('express');
const authRoutes = require('./src/routes/authRoutes');
const app = express();
require('dotenv').config();
const { Pool } = require('pg');
const cors = require('cors');
app.use(cors({ credentials: true, origin: true }));
const userRoutes = require('./src/routes/userRoutes');
const apiRoutes = require('./src/routes/apiRoutes');


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes);

app.use('/user', userRoutes);

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
