import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity } from 'lucide-react';
import { socket } from '../services/socket';

const STEPS_PER_SEGMENT = 10;

const geocodeLocation = async (query) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Failed to geocode "${query}"`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`Location not found: ${query}`);
  }

  const first = results[0];
  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
  };
};

const AgentSimulator = ({
  orderId,
  agentId,
  isConnected,
  pickupLocation,
  dropLocation,
  onRouteResolved
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastLog, setLastLog] = useState(null);

  const currentPos = useRef({ lat: 0, lng: 0 });
  const routePointsRef = useRef([]);
  const segmentIndexRef = useRef(0);
  const stepInSegmentRef = useRef(0);
  const intervalRef = useRef(null);

  const startSimulation = async () => {
    if (!isConnected || !orderId || intervalRef.current) return;
    if (!pickupLocation?.trim() || !dropLocation?.trim()) {
      setLastLog('Please save pickup and drop locations first.');
      return;
    }

    try {
      setLastLog('Resolving pickup/drop locations on map...');

      const [pickupCoords, dropCoords] = await Promise.all([
        geocodeLocation(pickupLocation.trim()),
        geocodeLocation(dropLocation.trim()),
      ]);

      const routePoints = [
        { name: `Pickup: ${pickupLocation.trim()}`, ...pickupCoords },
        { name: `Drop: ${dropLocation.trim()}`, ...dropCoords },
      ];
      routePointsRef.current = routePoints;
      onRouteResolved?.(routePoints);
      setIsSimulating(true);

      // Reset route progress for each run and emit initial pickup location.
      segmentIndexRef.current = 0;
      stepInSegmentRef.current = 0;
      currentPos.current = { lat: routePoints[0].lat, lng: routePoints[0].lng };
      emitLocation(currentPos.current, `Pickup started at ${pickupLocation.trim()}`);

      intervalRef.current = setInterval(() => {
        sendTick();
      }, 2000);
    } catch (error) {
      setLastLog(error.message || 'Failed to resolve saved locations.');
      onRouteResolved?.([]);
    }
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
    const routePoints = routePointsRef.current;
    if (routePoints.length < 2) {
      stopSimulation();
      return;
    }

    if (segmentIndexRef.current >= routePoints.length - 1) {
      setLastLog(`Delivered at ${dropLocation.trim()}. Simulation completed.`);
      stopSimulation();
      return;
    }

    const from = routePoints[segmentIndexRef.current];
    const to = routePoints[segmentIndexRef.current + 1];
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
        Route from saved pickup to saved drop will be used for simulation.
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
