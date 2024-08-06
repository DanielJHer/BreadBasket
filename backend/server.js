const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

// Configure CORS
app.use(
  cors({
    origin: 'http://localhost:3000', // allow requests from frontend
  })
);

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/orderDB'; // Replace with your MongoDB URI if using MongoDB Atlas
mongoose.connect(mongoURI);

const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      id: String,
      name: String,
      quantity: Number,
    },
  ],
  date: String,
  orderTime: String,
});

const Order = mongoose.model('Order', orderSchema);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

// Function to send email
const sendEmail = async (subject, text) => {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'recipient-email@example.com',
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Endpoint to submit an order
app.post('/submit-order', async (req, res) => {
  const { token, items, date, orderTime } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const newOrder = new Order({
      userId,
      items,
      date,
      orderTime,
    });

    await newOrder.save();

    res.status(200).send('Order saved successfully');
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
});

// Scheduled task to run at 12am daily
cron.schedule('0 0 * * *', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format

  try {
    const orders = await Order.find({ date: formattedDate });

    const aggregatedQuantities = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        if (!acc[item.id]) {
          acc[item.id] = {
            name: item.name,
            quantity: 0,
          };
        }
        acc[item.id].quantity += item.quantity;
      });
      return acc;
    }, {});

    const emailText = Object.values(aggregatedQuantities)
      .map((item) => `${item.name}: ${item.quantity}`)
      .join('\n');

    await sendEmail(
      `Aggregated Quantities for Orders Due on ${formattedDate}`,
      `Here are the aggregated quantities for orders due tomorrow:\n\n${emailText}`
    );

    console.log(
      'Aggregated quantities for orders due tomorrow:',
      aggregatedQuantities
    );
  } catch (error) {
    console.error('Error fetching orders for tomorrow:', error);
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
