// loading environment variable
require('dotenv').config({ path: '../.env' });

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Parse JSON data of HTTP requests
const app = express();
app.use(bodyParser.json());

// Configure CORS
app.use(
  cors({
    origin: 'http://localhost:3000', // allow requests from frontend
  })
);

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Order template
const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      id: String,
      name: String,
      quantity: Number,
    },
  ],
  deliveryDate: String,
  orderTime: String,
  orderNumber: { type: Number, unique: true },
});

const Order = mongoose.model('Order', orderSchema);

// Order counter
const counterSchema = new mongoose.Schema({
  name: String,
  value: Number,
});

const Counter = mongoose.model('Counter', counterSchema);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Endpoint to submit an order
app.post('/submit-order', async (req, res) => {
  const { token, items, deliveryDate, orderTime } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get the current order number and increment it
    const counter = await Counter.findOneAndUpdate(
      { name: 'orderNumber' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const newOrderNumber = counter.value;

    // Create new order
    const newOrder = new Order({
      userId,
      items,
      deliveryDate,
      orderTime,
      orderNumber: newOrderNumber,
    });

    // Save order
    await newOrder.save();

    // Send confirmation email to the user
    const userEmail = decodedToken.email;
    const orderSummary = items
      .map((item) => `${item.name}: ${item.quantity}`)
      .join('\n');
    const emailText = `Thank you for your order! Your order number is ${newOrderNumber}.\n\nOrder Summary:\n${orderSummary}\n\nDelivery Date: ${deliveryDate}\nOrder Time: ${orderTime}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Order Confirmation',
      text: emailText,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Error sending confirmation email:', error.message);
      } else {
        console.log('Confirmation email sent:', info.response);
      }
    });

    // Return the order number to the frontend as JSON
    res.status(200).json({ orderNumber: newOrderNumber });
  } catch (error) {
    console.error('Error submitting order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
