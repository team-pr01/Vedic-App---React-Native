// utils/socket.ts
import { io } from 'socket.io-client';

// http://192.168.0.102:5000    Local ip
export const socket = io('https://vedic-app-server.onrender.com', {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
});

socket.on('connect', () => console.log('✅ Connected to socket:', socket.id));
socket.on('disconnect', (reason) => console.log('❌ Disconnected:', reason));
socket.on('connect_error', (err) => console.log('🚫 Connection error:', err));
