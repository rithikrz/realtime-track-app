const express = require('express');
const router = express.Router();
const trackingService = require('../services/trackingService');

/**
 * Basic health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Optional: Get the last known location of an order
 */
router.get('/location/:orderId', (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' });
  }

  const locationData = trackingService.getLocation(orderId);

  if (!locationData) {
    return res.status(404).json({ error: 'Location not found for the given orderId' });
  }

  res.status(200).json(locationData);
});

module.exports = router;
