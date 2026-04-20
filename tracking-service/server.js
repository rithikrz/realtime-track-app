const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const socketHandler = require('./socket/socketHandler');
const pino = require('pino');

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Create HTTP server wrapping the Express app
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Configure Socket.IO event handlers
socketHandler(io, logger);

server.listen(PORT, () => {
  logger.info(`Tracking Service is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
