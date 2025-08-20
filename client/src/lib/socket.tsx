import React, { useEffect, useRef, ReactNode } from "react";
import { useAuthStore } from "./store";

let socket: WebSocket | null = null;

export function getSocket(): WebSocket | null {
  return socket;
}

export function initializeSocket(token: string) {
  if (socket && socket.readyState === WebSocket.OPEN) return socket;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(
    token
  )}`;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      window.dispatchEvent(
        new CustomEvent(message.type, { detail: message.payload })
      );
    } catch (err) {
      console.error("WebSocket message handling error:", err);
    }
  };

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { accessToken, isAuthenticated } = useAuthStore();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socketRef.current = initializeSocket(accessToken);
    } else if (socketRef.current) {
      disconnectSocket();
      socketRef.current = null;
    }

    return () => {
      if (socketRef.current) {
        disconnectSocket();
      }
    };
  }, [isAuthenticated, accessToken]);

  return <>{children}</>;
}

// Custom hooks for real-time events
export function useRealtimeEvent<T = any>(
  eventName: string,
  handler: (data: T) => void
) {
  useEffect(() => {
    const handleEvent = (event: Event) => {
      handler((event as CustomEvent<T>).detail);
    };

    window.addEventListener(eventName, handleEvent as EventListener);
    return () =>
      window.removeEventListener(eventName, handleEvent as EventListener);
  }, [eventName, handler]);
}
