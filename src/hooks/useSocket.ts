import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000';

let sharedSocket: Socket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!sharedSocket) {
      sharedSocket = io(SERVER_URL, { autoConnect: false, transports: ['websocket'] });
    }
    socketRef.current = sharedSocket;
    return () => {};
  }, []);

  const connect = useCallback(() => {
    sharedSocket?.connect();
  }, []);

  const disconnect = useCallback(() => {
    sharedSocket?.disconnect();
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    sharedSocket?.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    sharedSocket?.on(event, handler);
    return () => { sharedSocket?.off(event, handler); };
  }, []);

  const off = useCallback((event: string) => {
    sharedSocket?.removeAllListeners(event);
  }, []);

  return { connect, disconnect, emit, on, off, socket: socketRef };
}
