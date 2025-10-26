const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const contactRoutes = require('./routes/contact');
const aboutRoutes = require('./routes/about');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secureshare';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/about', aboutRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SecureShare API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
