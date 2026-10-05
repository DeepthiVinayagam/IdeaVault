const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');

// Route handlers
const authRoutes = require('./routes/auth');
const ideasRoutes = require('./routes/ideas');
const projectsRoutes = require('./routes/projects');
const usersRoutes = require('./routes/users');

const app = express();

// CORS configuration supporting credentials (cookies)
const allowedOrigins = [
  config.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in local dev
    }
  },
  credentials: true
}));

app.use(cookieParser(config.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'IdeaVault API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/users', usersRoutes);

// Global 404 Handler for API
app.use((req, res) => {
  res.status(404).json({ error: `API route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: config.NODE_ENV === 'development' ? err.message : undefined 
  });
});

module.exports = app;
