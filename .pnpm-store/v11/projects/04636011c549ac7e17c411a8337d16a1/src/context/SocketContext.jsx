/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getAccessToken } from "@/lib/authToken";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    let active = true;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: (cb) => cb({ token: `Bearer ${getAccessToken()}` }),
    });

    newSocket.on("connect", () => {
      if (active) setSocket(newSocket);
    });

    return () => {
      active = false;
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
export function useSocket() {
  return useContext(SocketContext);
}

export default SocketContext;
