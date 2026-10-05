import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (token) => {
  if (!socket && token) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      autoConnect: true,
    });
  } else if (socket && token) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
