// loading environment variable
require('dotenv').config({ path: '../.env' });

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const path = require('path');

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

// Querying the database for excel order
async function getOrdersForDate(targetDate) {
  try {
    // Convert targetDate to a string in the format 'YYYY-MM-DD'
    const formattedDate = targetDate.toISOString().split('T')[0];

    // Find orders in database
    const orders = await Order.find({
      deliveryDate: formattedDate,
    });

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// Function to generate excel spreadsheet
function generateExcel(orders) {
  const data = [];

  // Define headers based on the bread types
  const headers = [
    'Vendor',
    'COUNTRY',
    'POLENTA',
    'BLACK SES',
    'GOCH',
    'CIA (SM)',
    'CIA (L)',
    'FOUG',
    'FOC',
    'BAG',
    'BAG (SES)',
    'MILKBREAD',
    'BUNS',
  ];

  // Push headers to the first row
  data.push(headers);

  // Populate rows
  orders.forEach((order) => {
    const row = [order.vendor]; // Assuming each order has a vendor field

    // Add quantities for each bread type
    headers.slice(1).forEach((breadType) => {
      const item = order.items.find((i) => i.name === breadType);
      row.push(item ? item.quantity : 0); // Push the quantity or 0 if not found
    });

    data.push(row);
  });

  // Create a new workbook and add the data
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  // Write to file
  const filePath = path.join(__dirname, 'Bread_Orders.xlsx');
  XLSX.writeFile(workbook, filePath);

  return filePath;
}

// Sending automated email with excel
async function sendEmail(filePath) {
  console.log('Attempting to send email...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'danieljher@berkeley.edu',
    subject: 'Daily Bread Orders',
    text: 'Please find attached the daily bread orders.',
    attachments: [{ filename: 'Bread_Orders.xlsx', path: filePath }],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Creating the automated task
cron.schedule('0 0 * * *', async () => {
  console.log('Cron job ran at midnight');
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 2);

  const orders = await getOrdersForDate(targetDate);
  if (orders.length > 0) {
    const filePath = generateExcel(orders);
    sendEmail(filePath);
  } else {
    console.log('No orders found for the target date.');
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function manualEmailSending() {
  try {
    console.log('Starting manual email sending process...');

    // Calculate the target date (two days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);

    // Fetch the orders for that date
    const orders = await getOrdersForDate(targetDate);
    if (orders.length > 0) {
      const filePath = generateExcel(orders);
      console.log('Generated Excel file at:', filePath);
      await sendEmail(filePath);
    } else {
      console.log('No orders found for the target date.');
    }

    console.log('Manual email sending process completed.');
  } catch (error) {
    console.error('Error during manual email sending process:', error);
  }
}

manualEmailSending();
