import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dbConnection from './config/database';
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import notificationRoutes from './routes/notificationRoutes';
import notificationScheduler from './services/notificationScheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic health check route
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Event Reminder API is running',
    database: dbConnection.isConnected() ? 'connected' : 'disconnected'
  });
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    await dbConnection.connect();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Start notification scheduler
    notificationScheduler.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  notificationScheduler.stop();
  await dbConnection.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  notificationScheduler.stop();
  await dbConnection.disconnect();
  process.exit(0);
});

startServer();

export default app;
