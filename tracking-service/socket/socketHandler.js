const trackingService = require('../services/trackingService');

const socketHandler = (io, logger) => {
  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // User or Agent joins an order room
    socket.on('joinOrder', (orderId) => {
      if (!orderId || typeof orderId !== 'string') {
        logger.warn(`Invalid orderId requested by socket: ${socket.id}`);
        return;
      }
      socket.join(orderId);
      logger.info(`Socket ${socket.id} joined room for order: ${orderId}`);
    });

    // User or Agent leaves an order room
    socket.on('leaveOrder', (orderId) => {
      if (!orderId || typeof orderId !== 'string') return;
      socket.leave(orderId);
      logger.info(`Socket ${socket.id} left room for order: ${orderId}`);
    });

    // Agent sends a live location update
    socket.on('sendLocation', (payload) => {
      logger.debug({ payload }, `Received location update from ${socket.id}`);

      // Process update through the service layer
      const result = trackingService.updateLocation(payload);

      if (result.error) {
        logger.error(`Failed to update location for socket ${socket.id}: ${result.error}`);
        // Optionally notify the sender of the error
        socket.emit('locationError', { message: result.error });
        return;
      }

      const { data } = result;

      // Broadcast update to everyone in the room (including the sender? Typically not unless they want to see it, but we use `to()` which usually includes everyone in the room EXCEPT the sender if broadcasted, but we want everyone in the room. Wait, `io.to(orderId).emit` broadcasts to all sockets in the room, including the sender if they're in it)
      io.to(data.orderId).emit('locationUpdate', data);
      logger.debug(`Broadcasted location update for order ${data.orderId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
