import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const MAX_HISTORY = 60; // keep 60 data points (~3 min at 3s interval)

export function useSocket() {
  const [metrics, setMetrics]     = useState(null);
  const [history, setHistory]     = useState([]);
  const [alerts, setAlerts]       = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SERVER, { transports: ['websocket'], reconnectionDelay: 2000 });
    socketRef.current = socket;

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('systemMetrics', (data) => {
      setMetrics(data);
      setHistory(prev => {
        const next = [...prev, {
          ts:           data.ts,
          cpu:          data.cpu?.usagePercent ?? 0,
          memPercent:   data.memory?.usedPercent ?? 0,
          diskPercent:  data.disk?.usedPercent ?? 0,
          rxKB:         Math.round((data.network?.rxBytesPerSec ?? 0) / 1024),
          txKB:         Math.round((data.network?.txBytesPerSec ?? 0) / 1024),
        }];
        return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      });
    });

    socket.on('alert', (payload) => {
      setAlerts(prev => [{ ...payload, id: Date.now() }, ...prev].slice(0, 20));
    });

    return () => socket.disconnect();
  }, []);

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return { metrics, history, alerts, connected, dismissAlert };
}
