import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity } from 'lucide-react';
import { socket } from '../services/socket';

const ROUTE_POINTS = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Karnal', lat: 29.6857, lng: 76.9905 },
  { name: 'Ambala', lat: 30.3782, lng: 76.7767 },
  { name: 'Mohali', lat: 30.7046, lng: 76.7179 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
];

const STEPS_PER_SEGMENT = 10;

const AgentSimulator = ({ orderId, agentId, isConnected }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastLog, setLastLog] = useState(null);

  const currentPos = useRef({ lat: ROUTE_POINTS[0].lat, lng: ROUTE_POINTS[0].lng });
  const segmentIndexRef = useRef(0);
  const stepInSegmentRef = useRef(0);
  const intervalRef = useRef(null);

  const startSimulation = () => {
    if (!isConnected || !orderId || intervalRef.current) return;

    setIsSimulating(true);

    // Reset route progress for each run and emit initial pickup location.
    segmentIndexRef.current = 0;
    stepInSegmentRef.current = 0;
    currentPos.current = { lat: ROUTE_POINTS[0].lat, lng: ROUTE_POINTS[0].lng };
    emitLocation(currentPos.current, 'Pickup started in Delhi');

    intervalRef.current = setInterval(() => {
      sendTick();
    }, 2000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const emitLocation = (position, statusText) => {
    const payload = {
      orderId,
      agentId,
      lat: position.lat,
      lng: position.lng,
    };

    socket.emit('sendLocation', payload);
    setLastLog(`${statusText}: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`);
  };

  const sendTick = () => {
    if (segmentIndexRef.current >= ROUTE_POINTS.length - 1) {
      setLastLog('Delivered in Chandigarh. Simulation completed.');
      stopSimulation();
      return;
    }

    const from = ROUTE_POINTS[segmentIndexRef.current];
    const to = ROUTE_POINTS[segmentIndexRef.current + 1];
    const nextStep = stepInSegmentRef.current + 1;
    const progress = Math.min(nextStep / STEPS_PER_SEGMENT, 1);

    // Interpolate position between route waypoints to simulate movement.
    const lat = from.lat + (to.lat - from.lat) * progress + (Math.random() - 0.5) * 0.0006;
    const lng = from.lng + (to.lng - from.lng) * progress + (Math.random() - 0.5) * 0.0006;
    currentPos.current = { lat, lng };

    emitLocation(currentPos.current, `Moving ${from.name} -> ${to.name}`);

    stepInSegmentRef.current = nextStep;

    if (progress >= 1) {
      segmentIndexRef.current += 1;
      stepInSegmentRef.current = 0;
    }
  };

  useEffect(() => {
    return () => stopSimulation(); // Cleanup on unmount
  }, []);

  return (
    <div className="simulator-card">
      <div className="simulator-header">
        <Activity size={20} style={{ color: isSimulating ? 'var(--primary)' : 'var(--text-muted)' }} />
        <span>Agent Simulation</span>
      </div>
      
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Demo route: Delhi {'->'} Mohali {'->'} Chandigarh. Start simulation to watch live movement.
      </p>

      {isSimulating ? (
        <button 
          className="btn btn-danger" 
          onClick={stopSimulation}
          disabled={!isConnected}
        >
          <Square size={16} /> Stop Simulation
        </button>
      ) : (
        <button 
          className="btn btn-primary" 
          onClick={startSimulation}
          disabled={!isConnected || !orderId}
        >
          <Play size={16} fill="currentColor" /> Start Simulation
        </button>
      )}

      {lastLog && (
        <div className="log-box">
          &gt; {lastLog}
        </div>
      )}
    </div>
  );
};

export default AgentSimulator;
