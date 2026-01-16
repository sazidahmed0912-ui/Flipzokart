import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = (token: string | null) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (token) {
      // Connect to Socket.IO server
      const socket = io(BACKEND_URL, {
        auth: {
          token: token,
        },
      });

      socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
      });

      socket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err.message);
      });

      socketRef.current = socket;
    } else if (socketRef.current) {
      // Disconnect if token is removed
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  return socketRef.current;
};