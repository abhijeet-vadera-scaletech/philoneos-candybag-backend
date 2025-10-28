import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config/config.js';
import { googleSheetsService } from './services/googleSheets.js';
import { sendGridService } from './services/sendgrid.js';
import newsletterRoutes from './routes/newsletter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Validate configuration
validateConfig();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Stricter rate limit for subscription endpoint
const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 subscription requests per hour
  message: 'Too many subscription attempts, please try again later.',
});

app.use('/api/subscribe', subscribeLimiter);

// Routes
app.use('/api', newsletterRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Newsletter API Server',
    version: '1.0.0',
    endpoints: {
      subscribe: 'POST /api/subscribe',
      sendBulkEmails: 'POST /api/send-bulk-emails',
      getUnsentSubscribers: 'GET /api/subscribers/unsent',
      health: 'GET /api/health',
    },
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services and start server
const startServer = async () => {
  try {
    // Initialize Google Sheets
    await googleSheetsService.initialize();
    
    // Initialize SendGrid
    sendGridService.initialize();

    // Start server
    app.listen(config.port, () => {
      console.log('🚀 Server is running');
      console.log(`📍 Port: ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API URL: http://localhost:${config.port}`);
      console.log('\n📋 Available endpoints:');
      console.log(`   POST   /api/subscribe`);
      console.log(`   POST   /api/send-bulk-emails`);
      console.log(`   GET    /api/subscribers/unsent`);
      console.log(`   GET    /api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer();
