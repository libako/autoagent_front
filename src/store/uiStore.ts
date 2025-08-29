import { create } from "zustand";

type UIState = {
  // Filtros y búsquedas
  agentFilters: {
    search: string;
    provider: string;
    autonomy: string;
  };
  
  // Selecciones activas
  selectedAgentId: string | null;
  selectedSessionId: string | null;
  selectedMcpServerId: string | null;
  
  // Estados de modales
  modals: {
    createAgent: boolean;
    createMcpServer: boolean;
    toolConfig: boolean;
  };
  
  // Estados de carga
  loading: {
    agents: boolean;
    sessions: boolean;
    mcpServers: boolean;
  };
  
  // Acciones
  setAgentFilters: (filters: Partial<UIState['agentFilters']>) => void;
  setSelectedAgentId: (id: string | null) => void;
  setSelectedSessionId: (id: string | null) => void;
  setSelectedMcpServerId: (id: string | null) => void;
  setModalOpen: (modal: keyof UIState['modals'], open: boolean) => void;
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void;
  reset: () => void;
};

const initialState = {
  agentFilters: {
    search: "",
    provider: "",
    autonomy: "",
  },
  selectedAgentId: null,
  selectedSessionId: null,
  selectedMcpServerId: null,
  modals: {
    createAgent: false,
    createMcpServer: false,
    toolConfig: false,
  },
  loading: {
    agents: false,
    sessions: false,
    mcpServers: false,
  },
};

export const useUIStore = create<UIState>((set, get) => ({
  ...initialState,
  
  setAgentFilters: (filters) => {
    set((state) => ({
      agentFilters: { ...state.agentFilters, ...filters }
    }));
  },
  
  setSelectedAgentId: (id) => {
    set({ selectedAgentId: id });
  },
  
  setSelectedSessionId: (id) => {
    set({ selectedSessionId: id });
  },
  
  setSelectedMcpServerId: (id) => {
    set({ selectedMcpServerId: id });
  },
  
  setModalOpen: (modal, open) => {
    set((state) => ({
      modals: { ...state.modals, [modal]: open }
    }));
  },
  
  setLoading: (key, loading) => {
    set((state) => ({
      loading: { ...state.loading, [key]: loading }
    }));
  },
  
  reset: () => {
    set(initialState);
  },
}));
