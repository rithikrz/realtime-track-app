const store = require('../store/inMemoryStore');

/**
 * Validates incoming location payload
 * @param {Object} payload 
 * @returns {boolean}
 */
const isValidLocationUpdate = (payload) => {
  if (!payload) return false;
  
  const { orderId, agentId, lat, lng } = payload;
  
  if (!orderId || typeof orderId !== 'string') return false;
  if (!agentId || typeof agentId !== 'string') return false;
  
  if (lat === undefined || typeof lat !== 'number') return false;
  if (lng === undefined || typeof lng !== 'number') return false;

  // Validate lat/lng ranges
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;

  return true;
};

/**
 * Handles incoming location updates
 * @param {Object} payload { orderId, agentId, lat, lng }
 * @returns {Object} Stored and formatted location record or error object
 */
const updateLocation = (payload) => {
  if (!isValidLocationUpdate(payload)) {
    return { error: 'Invalid location payload' };
  }

  const { orderId, agentId, lat, lng } = payload;
  
  const locationRecord = {
    orderId,
    agentId,
    location: { lat, lng },
    updatedAt: new Date().toISOString(),
  };

  store.setLocation(orderId, locationRecord);
  
  return { data: locationRecord };
};

/**
 * Gets the latest location for an order
 * @param {string} orderId 
 * @returns {Object|null}
 */
const getLocation = (orderId) => {
  const result = store.getLocation(orderId);
  return result || null;
};

module.exports = {
  updateLocation,
  getLocation,
  isValidLocationUpdate
};
