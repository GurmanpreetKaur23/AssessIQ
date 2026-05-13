const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedQuestions = require('./config/seed');

dotenv.config();
connectDB().then(() => seedQuestions());

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Routes — all prefixed with /api
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/tests',     require('./routes/testRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ml',        require('./routes/adminRoutes'));        // /api/ml/predict-performance
app.use('/api/admin',     require('./routes/adminPanelRoutes'));   // /api/admin/questions

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'AssessIQ API running' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ detail: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
