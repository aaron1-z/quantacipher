const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');

const app = express();

// Use CORS middleware
app.use(cors());

// Built-in body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  });

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/store', require('./routes/storeRoutes'));
app.use('/api/retrieve', require('./routes/retrieveRoutes'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
