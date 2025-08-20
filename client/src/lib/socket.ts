import React, { useEffect, useRef, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./store";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function initializeSocket(token: string) {
  if (socket?.connected) return socket;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  socket = io(wsUrl, {
    transports: ['websocket'],
    query: { token },
    forceNew: true,
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Handle real-time events
  socket.on('post.created', (data) => {
    // Emit custom event for components to listen
    window.dispatchEvent(new CustomEvent('newPost', { detail: data }));
  });

  socket.on('comment.created', (data) => {
    window.dispatchEvent(new CustomEvent('newComment', { detail: data }));
  });

  socket.on('poll.tally', (data) => {
    window.dispatchEvent(new CustomEvent('pollTally', { detail: data }));
  });

  socket.on('notification', (data) => {
    window.dispatchEvent(new CustomEvent('newNotification', { detail: data }));
  });

  socket.on('report.opened', (data) => {
    window.dispatchEvent(new CustomEvent('newReport', { detail: data }));
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { accessToken, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

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
    const handleEvent = (event: CustomEvent<T>) => {
      handler(event.detail);
    };

    window.addEventListener(eventName as any, handleEvent);
    return () => window.removeEventListener(eventName as any, handleEvent);
  }, [eventName, handler]);
}
