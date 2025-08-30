const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const userRoutes = require('./src/routes/userRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const cors = require('cors');

dotenv.config(); // This will load the .env variables


const app = express();
app.use(cookieParser()); // Middleware to parse cookies
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors({
  origin: ['http://localhost:3000', 'https://authentication-ui.onrender.com'],// Adjust this to your frontend's origin
  credentials: true, // Allow cookies to be sent
})); 
// app.options('*', cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/users', userRoutes); // Handle routes related to users
app.use('/api', taskRoutes);
// Server listening on port 5000
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
