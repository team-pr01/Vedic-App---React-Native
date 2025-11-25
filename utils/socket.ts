// utils/socket.ts
import { io } from 'socket.io-client';
// https://vedic-app-server.onrender.com
// http://192.168.0.102:5000    Local ip
export const socket = io("http://192.168.0.102:5000", {
  transports: ["websocket"],
  autoConnect: false, // <--- IMPORTANT
  reconnection: true,
});

// Connect only when we manually request
export const initSocket = () => {
  if (!socket.connected) {
    console.log("🔌 Connecting socket...");
    socket.connect();
  }
};

// Debug logs
socket.on("connect", () => {
  console.log("✅ Socket Connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket Disconnected");
});