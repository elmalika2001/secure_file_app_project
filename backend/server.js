const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

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

// Connect to MongoDB (using in-memory server for development)
async function connectDB() {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Memory Server connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Secure File-Sharing API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
