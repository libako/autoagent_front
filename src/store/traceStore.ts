import { create } from "zustand";
import { TraceEvent, SignalREvent, SessionStatus } from "@/types/domain";

type TraceItem = { 
  eventId?: string; // ID único del evento
  kind: TraceEvent["kind"]; 
  payload: any; 
  at: string;
  idx?: number;
  sessionId?: string;
};

type TraceState = {
  bySession: Record<string, TraceItem[]>;
  sessionStatus: Record<string, SessionStatus>;
  append: (evt: SignalREvent | { 
    sessionId: string; 
    kind: TraceEvent["kind"]; 
    payload: any; 
    at: string;
    idx?: number;
    eventId?: string;
  }) => void;
  clear: (sessionId: string) => void;
  getSessionTraces: (sessionId: string) => TraceItem[];
  updateSessionStatus: (sessionId: string, status: SessionStatus) => void;
  getSessionStatus: (sessionId: string) => SessionStatus;
};

export const useTraceStore = create<TraceState>((set, get) => ({
  bySession: {},
  sessionStatus: {},
  
  append: ({ sessionId, eventId, ...evt }) => {
    set((state) => {
      const existingTraces = state.bySession[sessionId] || [];
      
      // Si tenemos un eventId único, usarlo para deduplicación
      if (eventId) {
        const isDuplicate = existingTraces.some(existingTrace => 
          existingTrace.eventId === eventId
        );
        
        if (isDuplicate) {
          console.log('Evento duplicado detectado por eventId, ignorando:', eventId);
          return state;
        }
      } else {
        // Fallback a la lógica anterior para compatibilidad
        if (evt.kind === 'summary') {
          const isDuplicate = existingTraces.some(existingTrace => 
            existingTrace.kind === evt.kind &&
            existingTrace.at === evt.at &&
            existingTrace.payload?.content === evt.payload?.content
          );
          
          if (isDuplicate) {
            console.log('Evento summary duplicado detectado, ignorando:', evt);
            return state;
          }
        } else {
          const isDuplicate = existingTraces.some(existingTrace => 
            existingTrace.kind === evt.kind &&
            existingTrace.at === evt.at &&
            JSON.stringify(existingTrace.payload) === JSON.stringify(evt.payload)
          );
          
          if (isDuplicate) {
            console.log('Traza duplicada detectada, ignorando:', evt);
            return state;
          }
        }
      }
      
      const newTraces = [...existingTraces, { ...evt, eventId, sessionId }];
      return {
        bySession: {
          ...state.bySession,
          [sessionId]: newTraces
        }
      };
    });
  },
  
  clear: (sessionId) => {
    set((state) => {
      const newState = { ...state.bySession };
      const newStatus = { ...state.sessionStatus };
      delete newState[sessionId];
      delete newStatus[sessionId];
      return { bySession: newState, sessionStatus: newStatus };
    });
  },
  
  getSessionTraces: (sessionId) => {
    return get().bySession[sessionId] || [];
  },

  updateSessionStatus: (sessionId, status) => {
    set((state) => ({
      sessionStatus: {
        ...state.sessionStatus,
        [sessionId]: status
      }
    }));
  },

  getSessionStatus: (sessionId) => {
    return get().sessionStatus[sessionId] || "disconnected";
  },
}));
