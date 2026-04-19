import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { io } from "socket.io-client";

// Determine socket URL based on environment
const getSocketURL = () => {
  const isDev = window.location.hostname === "localhost" || 
                window.location.hostname === "127.0.0.1";
  
  if (isDev) {
    return "http://localhost:3001";
  }
  
  // Production: Use Render backend URL
  // Replace with your actual Render backend URL
  const backendURL = import.meta.env.VITE_SOCKET_URL || 
                     "https://lpu-metavese.onrender.com";
  return backendURL;
};

export const socket = io(getSocketURL(), {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

export const charactersAtom = atom([]);
export const messagesAtom = atom([]);

export const SocketManager = () => {
  const [_characters, setCharacters] = useAtom(charactersAtom);
  const [_messages, setMessages] = useAtom(messagesAtom);
  useEffect(() => {
    function onConnect() {
      console.log("connected");
    }
    function onDisconnect() {
      console.log("disconnected");
    }

    function onHello() {
      console.log("hello");
    }

    function onCharacters(value) {
      setCharacters(value);
    }

    function onMessage(message) {
      setMessages((prev) => [...prev, message]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("hello", onHello);
    socket.on("characters", onCharacters);
    socket.on("message", onMessage);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("hello", onHello);
      socket.off("characters", onCharacters);
      socket.off("message", onMessage);
    };
  }, []);
};
