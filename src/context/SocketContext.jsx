import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext(null);

// Works in both Vite (VITE_API_URL) and CRA (REACT_APP_API_URL)
const getApiBaseUrl = () => {
  const viteUrl =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_URL;

  const craUrl =
    typeof process !== 'undefined' &&
    process.env &&
    process.env.REACT_APP_API_URL;

  return viteUrl || craUrl || 'http://localhost:5000';
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Avoid running during SSR
    if (typeof window === 'undefined') return;

    const url = getApiBaseUrl();

    const newSocket = io(url, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      newSocket.removeAllListeners();
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export default SocketContext;