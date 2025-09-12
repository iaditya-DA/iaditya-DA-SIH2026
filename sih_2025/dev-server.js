import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import the serverless functions
import teamsHandler from './api/teams.js';
import individualsHandler from './api/individuals.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to wrap serverless functions for Express
function wrapHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}

// API Routes
app.get('/api/teams', wrapHandler(teamsHandler));
app.get('/api/individuals', wrapHandler(individualsHandler));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log('API endpoints:');
  console.log(`  GET http://localhost:${PORT}/api/teams`);
  console.log(`  GET http://localhost:${PORT}/api/individuals`);
});
