import React, { useEffect, useState } from 'react';
import { socket } from './services/socket';
import MapView from './components/MapView';
import AgentSimulator from './components/AgentSimulator';
import { MapPin, Package, Save, Smartphone } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

function App() {
  const [orderId, setOrderId] = useState('order-123');
  const [agentId] = useState(() => `agent-${Math.floor(Math.random() * 1000)}`);

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [agentLocation, setAgentLocation] = useState(null);
  const [deliveryRoutePoints, setDeliveryRoutePoints] = useState([]);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [isSavingLocations, setIsSavingLocations] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  // Connection Event Handlers
  useEffect(() => {
    // Explicit connect since autoConnect is false
    socket.connect();

    function onConnect() {
      setIsConnected(true);
      // Join order automatically on reconnect
      socket.emit('joinOrder', orderId);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onLocationUpdate(data) {
      console.log('Location Update', data);
      setAgentLocation({ lat: data.location.lat, lng: data.location.lng });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('locationUpdate', onLocationUpdate);

    // Initial Join
    socket.emit('joinOrder', orderId);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('locationUpdate', onLocationUpdate);
      socket.emit('leaveOrder', orderId);
    };
  }, [orderId]);

  // Handle manual order tracking change
  const handleOrderChange = (e) => {
    const newOrderId = e.target.value;
    // Leave current order
    socket.emit('leaveOrder', orderId);

    // Clear old state & start new one
    setAgentLocation(null);
    setDeliveryRoutePoints([]);
    setOrderId(newOrderId);
    socket.emit('joinOrder', newOrderId);
  };

  const handleSaveOrderLocations = async () => {
    if (!orderId || !pickupLocation.trim() || !dropLocation.trim()) {
      setLocationMessage('Order ID, pickup, and drop locations are required.');
      return;
    }

    try {
      setIsSavingLocations(true);
      setLocationMessage('');

      const response = await fetch(`${API_BASE_URL}/api/order-locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId.trim(),
          pickupLocation: pickupLocation.trim(),
          dropLocation: dropLocation.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save locations');
      }

      setPickupLocation(data.pickupLocation || '');
      setDropLocation(data.dropLocation || '');
      setLocationMessage('Delivery locations saved successfully.');
    } catch (error) {
      setLocationMessage(error.message || 'Failed to save locations');
    } finally {
      setIsSavingLocations(false);
    }
  };

  useEffect(() => {
    const trimmedOrderId = orderId.trim();
    if (!trimmedOrderId) {
      setPickupLocation('');
      setDropLocation('');
      setLocationMessage('');
      return;
    }

    const fetchOrderLocations = async () => {
      try {
        setIsLoadingLocations(true);
        setLocationMessage('');

        const response = await fetch(`${API_BASE_URL}/api/order-locations/${encodeURIComponent(trimmedOrderId)}`);

        if (response.status === 404) {
          setPickupLocation('');
          setDropLocation('');
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch order locations');
        }

        setPickupLocation(data.pickupLocation || '');
        setDropLocation(data.dropLocation || '');
      } catch (error) {
        setLocationMessage(error.message || 'Failed to fetch order locations');
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchOrderLocations();
  }, [orderId]);

  return (
    <div className='app-container'>
      {/* Sidebar Controls */}
      <aside className='sidebar'>
        <header className='sidebar-header'>
          <h1>
            <Package
              size={24}
              style={{ color: 'var(--primary)' }}
            />
            Trackr Hub
          </h1>
        </header>

        <div className='sidebar-content'>
          <div className='form-group'>
            <label htmlFor='orderId'>Order Tracking ID</label>
            <input
              className='input-field'
              id='orderId'
              type='text'
              value={orderId}
              onChange={handleOrderChange}
              placeholder='e.g. order-123'
            />
          </div>

          <div className='simulator-card'>
            <div className='simulator-header'>
              <MapPin size={20} style={{ color: 'var(--primary)' }} />
              <span>Delivery Locations</span>
            </div>

            <div className='form-group'>
              <label htmlFor='pickupLocation'>Pickup Location</label>
              <input
                className='input-field'
                id='pickupLocation'
                type='text'
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder='e.g. Delhi Sector 18'
              />
            </div>

            <div className='form-group'>
              <label htmlFor='dropLocation'>Drop Location</label>
              <input
                className='input-field'
                id='dropLocation'
                type='text'
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                placeholder='e.g. Chandigarh IT Park'
              />
            </div>

            <button
              className='btn btn-primary'
              onClick={handleSaveOrderLocations}
              disabled={isSavingLocations || isLoadingLocations || !orderId.trim()}
              type='button'
            >
              <Save size={16} />
              {isSavingLocations ? 'Saving...' : 'Save Locations'}
            </button>

            {isLoadingLocations && (
              <p className='form-hint'>Loading saved locations...</p>
            )}
            {locationMessage && (
              <p className='form-hint'>{locationMessage}</p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Connection Status</span>
            <div className={`status-badge ${isConnected ? 'connected' : ''}`}>
              <div className='pulse-dot'></div>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          {/* Agent Simulation Tool */}
          <div style={{ marginTop: 'auto' }}>
            <AgentSimulator
              isConnected={isConnected}
              orderId={orderId}
              agentId={agentId}
              pickupLocation={pickupLocation}
              dropLocation={dropLocation}
              onRouteResolved={setDeliveryRoutePoints}
            />
          </div>
        </div>
      </aside>

      {/* Primary Map View */}
      <main className='map-container'>
        <MapView
          agentLocation={agentLocation}
          routePoints={deliveryRoutePoints}
        />

        {/* Floating Tracking Card Overlay */}
        {agentLocation && (
          <div className='map-card'>
            <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
              <Smartphone
                size={24}
                style={{ color: 'var(--primary)' }}
              />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Agent is nearby</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Arriving safely to your destination.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
