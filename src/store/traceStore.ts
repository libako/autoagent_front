import { create } from "zustand";
import { TraceEvent } from "@/types/domain";

type TraceItem = { 
  kind: TraceEvent["kind"]; 
  payload: any; 
  at: string;
  idx?: number;
};

type TraceState = {
  bySession: Record<string, TraceItem[]>;
  append: (evt: { 
    sessionId: string; 
    kind: TraceEvent["kind"]; 
    payload: any; 
    at: string;
    idx?: number;
  }) => void;
  clear: (sessionId: string) => void;
  getSessionTraces: (sessionId: string) => TraceItem[];
};

export const useTraceStore = create<TraceState>((set, get) => ({
  bySession: {},
  
  append: ({ sessionId, ...evt }) => {
    set((state) => {
      const newTraces = [...(state.bySession[sessionId] || []), evt];
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
      delete newState[sessionId];
      return { bySession: newState };
    });
  },
  
  getSessionTraces: (sessionId) => {
    return get().bySession[sessionId] || [];
  },
}));
