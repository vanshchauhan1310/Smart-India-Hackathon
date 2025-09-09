import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, User, AuthState, EventItem } from '../types';

interface AppContextType {
  state: AppState;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addEvent: (event: Omit<EventItem, 'id'>) => void;
}

type AppAction =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESTORE_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_EVENT'; payload: EventItem };

const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  },
  selectedLanguage: 'en',
  theme: 'light',
  events: [],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload.user,
          token: action.payload.token,
          loading: false,
        },
      };
    case 'LOGOUT':
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        },
      };
    case 'UPDATE_USER':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: state.auth.user ? { ...state.auth.user, ...action.payload } : null,
        },
      };
    case 'SET_LANGUAGE':
      return {
        ...state,
        selectedLanguage: action.payload,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        auth: {
          ...state.auth,
          loading: action.payload,
        },
      };
    case 'RESTORE_STATE':
      return {
        ...state,
        ...action.payload,
        auth: {
          ...state.auth,
          loading: false,
        },
      };
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...(state.events || []), action.payload],
      };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Restore state from AsyncStorage on app start
  useEffect(() => {
    const restoreState = async () => {
      try {
        const storedState = await AsyncStorage.getItem('appState');
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          dispatch({ type: 'RESTORE_STATE', payload: parsedState });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error restoring state:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    restoreState();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem('appState', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving state:', error);
      }
    };

    if (!state.auth.loading) {
      saveState();
    }
  }, [state]);

  const login = (user: User, token: string) => {
    dispatch({ type: 'LOGIN', payload: { user, token } });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    AsyncStorage.removeItem('appState');
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const setLanguage = (language: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const addEvent = (event: Omit<EventItem, 'id'>) => {
    const newEvent: EventItem = {
      id: Date.now().toString(),
      ...event,
    };
    dispatch({ type: 'ADD_EVENT', payload: newEvent });
  };

  const value: AppContextType = {
    state,
    login,
    logout,
    updateUser,
    setLanguage,
    setTheme,
    addEvent,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};