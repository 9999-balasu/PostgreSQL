// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const { Pool } = require('pg');
// const Razorpay = require('razorpay');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // PostgreSQL pool
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASS,
//   port: 5432,
// });

// // Test PostgreSQL connection
// pool.connect()
//   .then(() => console.log('PostgreSQL connected'))
//   .catch(err => console.error('PostgreSQL connection error:', err.message));

// // Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// // Get products

// app.get('/products', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM products');
//     res.json(result.rows); // this is always an array
//   } catch (err) {
//     console.error('Error fetching products:', err.message);
//     res.status(500).json([]); // return empty array instead of HTML
//   }
// });


// // app.get('/products', async (req, res) => {
// //   try {
// //     const result = await pool.query('SELECT * FROM products');
// //     res.json(result.rows);
// //   } catch (err) {
// //     console.error('Error fetching products:', err.message);
// //     res.status(500).json({ error: 'Failed to fetch products' });
// //   }
// // });

// // Create order for Razorpay
// app.post('/create-order', async (req, res) => {
//   const { amount, currency = 'INR' } = req.body;

//   if (!amount || amount <= 0) {
//     return res.status(400).json({ error: 'Invalid amount' });
//   }

//   const options = {
//     amount: amount * 100, // in paise
//     currency,
//     receipt: `receipt_${Date.now()}`,
//   };

//   try {
//     const order = await razorpay.orders.create(options);
//     res.json(order);
//   } catch (err) {
//     console.error('Razorpay order error:', err.message);
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const Razorpay = require('razorpay');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL pool
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASS,
//   port: process.env.DB_PORT,
// });



const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
});

pool.connect()
  .then(client => {
    console.log('PostgreSQL connected to database:', process.env.DB_NAME);
    client.release();
  })
  .catch(err => console.error('PostgreSQL connection error:', err.message));


// Test DB connection
pool.connect()
  .then(client => {
    console.log('PostgreSQL connected');
    client.release();
  })
  .catch(err => console.error('PostgreSQL connection error:', err.message));

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// GET products
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);  // always return an array
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json([]); // return empty array on error
  }
});

// Create Razorpay order
app.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const options = {
    amount: amount * 100, // in paise
    currency,
    receipt: `receipt_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Razorpay error:', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
