'use client';

// ============================================================
// WebSocket Hook — 实时通信
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import type { WebSocketMessage } from '@/types/api';

type MessageHandler = (message: WebSocketMessage) => void;

export function useWebSocket(
  path: string,
  handlers: Record<string, MessageHandler>,
  enabled = true
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${path}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[WS] Connected: ${path}`);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        const handler = handlers[message.type] || handlers['*'];
        if (handler) {
          handler(message);
        }
      } catch {
        console.warn('[WS] Failed to parse message:', event.data);
      }
    };

    ws.onclose = () => {
      console.log(`[WS] Disconnected: ${path}`);
      // 自动重连
      reconnectTimer.current = setTimeout(connect, 5000);
    };

    ws.onerror = (error) => {
      console.error(`[WS] Error: ${path}`, error);
      ws.close();
    };
  }, [path, handlers, enabled]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return wsRef;
}
