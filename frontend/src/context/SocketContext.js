import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const teacherId = user?.id || user?._id;
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io('http://localhost:5000', { transports: ['websocket'] });

    socketRef.current.on('connect', () => {
      setConnected(true);
      // Teachers auto-join their room
      if (user.role === 'teacher' && teacherId) {
        socketRef.current.emit('join_teacher_room', teacherId);
      }
    });

    socketRef.current.on('disconnect', () => setConnected(false));

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, teacherId]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
