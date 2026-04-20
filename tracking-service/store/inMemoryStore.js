/**
 * In-memory store using a Map to hold the latest location for each active order.
 * Expected structure per order:
 * {
 *   orderId: string,
 *   agentId: string,
 *   location: { lat: number, lng: number },
 *   updatedAt: ISO string
 * }
 */
class InMemoryStore {
  constructor() {
    this.locations = new Map();
  }

  /**
   * Updates or sets the location for an order
   * @param {string} orderId 
   * @param {Object} data 
   */
  setLocation(orderId, data) {
    this.locations.set(orderId, data);
  }

  /**
   * Retrieves the current location for an order
   * @param {string} orderId 
   * @returns {Object|undefined}
   */
  getLocation(orderId) {
    return this.locations.get(orderId);
  }

  /**
   * Deletes an order from the store
   * @param {string} orderId 
   */
  deleteLocation(orderId) {
    this.locations.delete(orderId);
  }

  /**
   * Checks if an order exists in the store
   * @param {string} orderId 
   * @returns {boolean}
   */
  hasLocation(orderId) {
    return this.locations.has(orderId);
  }
}

// Export a singleton instance
module.exports = new InMemoryStore();
