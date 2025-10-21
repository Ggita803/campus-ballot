import { useEffect, useState } from 'react';
import useSocket from './useSocket';

// Centralized hook to provide realtime dashboard state and events
export default function useRealtimeDashboard(initial = {}) {
  const { socketRef } = useSocket();
  const [state, setState] = useState(initial);

  useEffect(() => {
  const socket = socketRef?.current;
    if (!socket) return;

    const handlers = {
      'dashboard:update': (payload) => {
        setState(prev => ({ ...prev, dashboard: payload }));
      },
      'vote:update': (payload) => {
        setState(prev => ({ ...prev, lastVote: payload }));
      },
      'candidate:created': (payload) => {
        setState(prev => ({ ...prev, candidateCreated: payload }));
      },
      'candidate:updated': (payload) => {
        setState(prev => ({ ...prev, candidateUpdated: payload }));
      },
      'candidate:deleted': (payload) => {
        setState(prev => ({ ...prev, candidateDeleted: payload }));
      },
      'election:created': (payload) => {
        setState(prev => ({ ...prev, electionCreated: payload }));
      },
      'election:updated': (payload) => {
        setState(prev => ({ ...prev, electionUpdated: payload }));
      },
      'user:updated': (payload) => {
        setState(prev => ({ ...prev, userUpdated: payload }));
      }
    };

    Object.entries(handlers).forEach(([evt, fn]) => socket.on(evt, fn));

    return () => {
      Object.entries(handlers).forEach(([evt, fn]) => socket.off(evt, fn));
    };
  }, [socketRef]);

  return [state, setState];
}
