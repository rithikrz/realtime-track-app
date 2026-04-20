const io = require("socket.io-client");

const URL = "http://localhost:3001";
const socket1 = io(URL);
const socket2 = io(URL);

const orderId = "order-123";
const agentId = "agent-456";

socket1.on("connect", () => {
  console.log("Socket 1 (Agent) connected:", socket1.id);
  
  // Agent joins the order room
  socket1.emit("joinOrder", orderId);
  
  // Wait a bit for the other socket to connect and join, then send location
  setTimeout(() => {
    console.log("Agent sending location update...");
    socket1.emit("sendLocation", {
      orderId,
      agentId,
      lat: 40.7128,
      lng: -74.0060,
    });
  }, 1000);
});

socket2.on("connect", () => {
  console.log("Socket 2 (User) connected:", socket2.id);
  
  // User joins the same order room
  socket2.emit("joinOrder", orderId);
});

// Both sockets listening for location updates
socket1.on("locationUpdate", (data) => {
  console.log("Socket 1 received locationUpdate:", data);
});

socket2.on("locationUpdate", (data) => {
  console.log("Socket 2 received locationUpdate:", data);
  // Verify HTTP endpoint after update
  verifyHttpEndpoint();
});

async function verifyHttpEndpoint() {
  try {
    const res = await fetch(`http://localhost:3001/api/location/${orderId}`);
    const data = await res.json();
    console.log("HTTP GET /api/location response:", data);
    
    // Everything works, exit
    process.exit(0);
  } catch (error) {
    console.error("HTTP GET failed", error);
    process.exit(1);
  }
}

// Timeout to exit if things hang
setTimeout(() => {
  console.error("Test timed out");
  process.exit(1);
}, 5000);
