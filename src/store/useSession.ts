import { create } from 'zustand';

const SESSION_KEY = 'leankeep_api_tester_session';

interface SessionState {
  // Environment
  authHost: string;
  apiHost: string;
  empresaId: string;
  unidadeId: string;
  siteId: string;
  xTransactionId: string;

  // Auth
  token: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  refreshExpiresIn: number | null;
  tokenSetAt: number | null;

  // Settings
  redactMode: boolean;
  devOnly: boolean;

  // Actions
  setEnvVars: (vars: Partial<Pick<SessionState, 'authHost' | 'apiHost' | 'empresaId' | 'unidadeId' | 'siteId' | 'xTransactionId'>>) => void;
  setToken: (data: { token: string; refreshToken: string; expiresIn: number; refreshExpiresIn: number }) => void;
  logout: () => void;
  toggleRedact: () => void;
  fromSessionStorage: () => void;
  toSessionStorage: () => void;
  clearSessionStorage: () => void;
  isTokenExpired: () => boolean;
}

export const useSession = create<SessionState>((set, get) => ({
  // Default values
  authHost: 'https://auth.lkp.app.br',
  apiHost: 'https://api.lkp.app.br',
  empresaId: '',
  unidadeId: '',
  siteId: '',
  xTransactionId: '',

  token: null,
  refreshToken: null,
  expiresIn: null,
  refreshExpiresIn: null,
  tokenSetAt: null,

  redactMode: true,
  devOnly: true,

  setEnvVars: (vars) => {
    set(vars);
    get().toSessionStorage();
  },

  setToken: (data) => {
    const now = Date.now();
    set({
      token: data.token,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      refreshExpiresIn: data.refreshExpiresIn,
      tokenSetAt: now,
    });
    get().toSessionStorage();
  },

  logout: () => {
    set({
      token: null,
      refreshToken: null,
      expiresIn: null,
      refreshExpiresIn: null,
      tokenSetAt: null,
    });
    get().clearSessionStorage();
  },

  toggleRedact: () => {
    set((state) => ({ redactMode: !state.redactMode }));
  },

  fromSessionStorage: () => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set(data);
      }
    } catch (error) {
      console.error('Failed to load from sessionStorage', error);
    }
  },

  toSessionStorage: () => {
    try {
      const state = get();
      const toStore = {
        authHost: state.authHost,
        apiHost: state.apiHost,
        empresaId: state.empresaId,
        unidadeId: state.unidadeId,
        siteId: state.siteId,
        xTransactionId: state.xTransactionId,
        token: state.token,
        refreshToken: state.refreshToken,
        expiresIn: state.expiresIn,
        refreshExpiresIn: state.refreshExpiresIn,
        tokenSetAt: state.tokenSetAt,
        redactMode: state.redactMode,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save to sessionStorage', error);
    }
  },

  clearSessionStorage: () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear sessionStorage', error);
    }
  },

  isTokenExpired: () => {
    const state = get();
    if (!state.token || !state.tokenSetAt || !state.expiresIn) return true;
    const now = Date.now();
    const expiresAt = state.tokenSetAt + state.expiresIn * 1000;
    return now >= expiresAt;
  },
}));
