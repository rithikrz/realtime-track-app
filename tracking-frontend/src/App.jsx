import React, { useEffect, useState } from 'react';
import { socket } from './services/socket';
import MapView from './components/MapView';
import AgentSimulator from './components/AgentSimulator';
import { Package, Smartphone, RefreshCw } from 'lucide-react';

function App() {
  const [orderId, setOrderId] = useState('order-123');
  const [agentId] = useState(() => `agent-${Math.floor(Math.random() * 1000)}`);

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [agentLocation, setAgentLocation] = useState(null);

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
    setOrderId(newOrderId);
    socket.emit('joinOrder', newOrderId);
  };

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
            />
          </div>
        </div>
      </aside>

      {/* Primary Map View */}
      <main className='map-container'>
        <MapView agentLocation={agentLocation} />

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
