import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/services/api';

let socket: Socket | null = null;

export function connectRealtime(token: string) {
  if (socket && socket.connected) return socket;

  socket = io(API_BASE_URL, {
    transports: ['websocket'],
    auth: {
      token,
    },
  });

  return socket;
}

export function disconnectRealtime() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
