import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';

// Default center (India)
const defaultCenter = {
  lat: 22.9734,
  lng: 78.6569
};

const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.panTo(center, { animate: true, duration: 1 });
  }, [center, map]);

  return null;
};

const MapView = ({ agentLocation, routePoints = [] }) => {
  const routePolyline = routePoints.map(({ lat, lng }) => [lat, lng]);
  const pickupPoint = routePoints[0];
  const dropPoint = routePoints[1];

  const center = agentLocation
    || (pickupPoint ? { lat: pickupPoint.lat, lng: pickupPoint.lng } : defaultCenter);

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
        {routePolyline.length >= 2 && (
          <Polyline positions={routePolyline} pathOptions={{ color: '#334155', weight: 4, opacity: 0.7 }} />
        )}
        <RecenterMap center={center} />

        {pickupPoint && (
          <CircleMarker
            center={[pickupPoint.lat, pickupPoint.lng]}
            radius={7}
            pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.95 }}
          >
            <Popup>{pickupPoint.name}</Popup>
          </CircleMarker>
        )}

        {dropPoint && (
          <CircleMarker
            center={[dropPoint.lat, dropPoint.lng]}
            radius={7}
            pathOptions={{ color: '#ea580c', fillColor: '#ea580c', fillOpacity: 0.95 }}
          >
            <Popup>{dropPoint.name}</Popup>
          </CircleMarker>
        )}

        {agentLocation && (
          <CircleMarker
            center={center}
            radius={8}
            pathOptions={{ color: '#4F46E5', fillColor: '#4F46E5', fillOpacity: 0.95 }}
          >
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
