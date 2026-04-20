# Live Tracking App

A real-time order tracking demo built with:

- `tracking-frontend`: React + Vite + Socket.IO client + React Leaflet (OpenStreetMap)
- `tracking-service`: Node.js + Express + Socket.IO server

The app simulates live delivery movement and shows it on a map.

## Features

- Real-time location updates over WebSockets (`socket.io`)
- Order-based tracking rooms (`joinOrder`, `leaveOrder`)
- Live map rendering with **free OpenStreetMap tiles**
- Built-in agent simulator route:
  - Delhi -> Karnal -> Ambala -> Mohali -> Chandigarh
- Health and location APIs on backend

## Project Structure

```text
track-app/
  tracking-frontend/
  tracking-service/
```

## Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm

## Setup

Install dependencies in both apps:

```bash
cd tracking-service && npm install
cd ../tracking-frontend && npm install
```

## Environment Variables

### Backend (`tracking-service/.env`)

```env
PORT=3002
NODE_ENV=development
CORS_ORIGIN=*
```

### Frontend (`tracking-frontend/.env`)

```env
VITE_SOCKET_URL=http://localhost:3002
VITE_API_URL=http://localhost:3002
```

Note: Google Maps key is no longer required. The app now uses OpenStreetMap.

## Run the App

Open two terminals.

### Terminal 1 - backend

```bash
cd tracking-service
npm run dev
```

### Terminal 2 - frontend

```bash
cd tracking-frontend
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## How to Test Live Tracking

1. Open the frontend in browser.
2. Keep or enter any Order Tracking ID (for example: `order-123`).
3. Confirm connection status shows `Connected`.
4. Click **Start Simulation**.
5. Watch the marker move on map from Delhi towards Mohali/Chandigarh.

## API Endpoints (Backend)

- `GET /api/health` - service health check
- `GET /api/location/:orderId` - latest stored location for an order
- `POST /api/order-locations` - add/update delivery pickup and drop locations for an order
- `GET /api/order-locations/:orderId` - fetch saved pickup and drop locations for an order

## Socket Events

### Client -> Server

- `joinOrder` (`orderId`)
- `leaveOrder` (`orderId`)
- `sendLocation` (`{ orderId, agentId, lat, lng }`)

### Server -> Client

- `locationUpdate` (`{ orderId, agentId, location, updatedAt }`)
- `locationError` (`{ message }`)

## Build & Lint

### Frontend

```bash
cd tracking-frontend
npm run lint
npm run build
```

### Backend

```bash
cd tracking-service
npm start
```

## Troubleshooting

- **Map not visible**
  - Ensure frontend is running and browser can access OpenStreetMap tiles.
- **Disconnected status**
  - Ensure backend is running on port `3002`.
  - Ensure `VITE_SOCKET_URL` matches backend URL.
- **Port already in use (`EADDRINUSE`)**
  - Stop previous process using the same port, then restart.
