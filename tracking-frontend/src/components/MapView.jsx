import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';

const ROUTE_POINTS = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Karnal', lat: 29.6857, lng: 76.9905 },
  { name: 'Ambala', lat: 30.3782, lng: 76.7767 },
  { name: 'Mohali', lat: 30.7046, lng: 76.7179 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
];

const routePolyline = ROUTE_POINTS.map(({ lat, lng }) => [lat, lng]);

// Default center (Delhi)
const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.panTo(center, { animate: true, duration: 1 });
  }, [center, map]);

  return null;
};

const MapView = ({ agentLocation }) => {
  const center = agentLocation || defaultCenter;

  return (
    <div className="leaflet-map-wrapper">
      <MapContainer
        center={center}
        zoom={8}
        className="leaflet-map"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Polyline positions={routePolyline} pathOptions={{ color: '#334155', weight: 4, opacity: 0.7 }} />
        <RecenterMap center={center} />
        {agentLocation && (
          <CircleMarker center={center} radius={8} pathOptions={{ color: '#4F46E5', fillColor: '#4F46E5', fillOpacity: 0.95 }}>
            <Popup>
              Agent location:
              {' '}
              {agentLocation.lat.toFixed(5)}, {agentLocation.lng.toFixed(5)}
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
};

export default React.memo(MapView);
