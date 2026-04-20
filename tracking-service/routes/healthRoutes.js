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

/**
 * Add or update pickup/drop location details for an order
 */
router.post('/order-locations', (req, res) => {
  const result = trackingService.upsertOrderLocations(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(201).json(result.data);
});

/**
 * Get pickup/drop location details for an order
 */
router.get('/order-locations/:orderId', (req, res) => {
  const { orderId } = req.params;

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'orderId is required' });
  }

  const orderLocationData = trackingService.getOrderLocations(orderId);

  if (!orderLocationData) {
    return res.status(404).json({ error: 'Order locations not found for the given orderId' });
  }

  return res.status(200).json(orderLocationData);
});

module.exports = router;
