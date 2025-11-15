// Simplified socket client for development
export function initializeSocket(token: string) {
  console.log('WebSocket initialized with token:', token ? 'present' : 'missing');
  return null;
}

export function disconnectSocket() {
  console.log('WebSocket disconnected');
}

export function getSocket() {
  return null;
}

export function useRealtimeEvent(eventName: string, handler: (data: any) => void) {
  // Simple hook implementation for development
}