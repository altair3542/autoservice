import { createContext, useEffect, useMemo, useReducer } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, me as apiMe } from '../api';

export const AuthContext = createContext(null);

const initial = { isLoading: true, token: null, user: null };

function reducer(state, a) {
  switch (a.type) {
    case 'RESTORE': return { ...state, isLoading: false, token: a.token, user: a.user ?? null };
    case 'SIGN_IN': return { ...state, token: a.token, user: a.user, isLoading: false };
    case 'SIGN_OUT': return { ...state, token: null, user: null, isLoading: false };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // Restaurar sesión al abrir
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          const me = await apiMe().catch(() => null);
          dispatch({ type: 'RESTORE', token, user: me });
        } else {
          dispatch({ type: 'RESTORE', token: null, user: null });
        }
      } catch {
        dispatch({ type: 'RESTORE', token: null, user: null });
      }
    })();
  }, []);

  const actions = useMemo(() => ({
    signIn: async (username, password) => {
      const data = await apiLogin({ username, password });
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      const user = { id: data.id, username: data.username, email: data.email };
      dispatch({ type: 'SIGN_IN', token: data.accessToken, user });
    },
    signOut: async () => {
      await Promise.all([
        SecureStore.deleteItemAsync('accessToken'),
        SecureStore.deleteItemAsync('idToken'),
        SecureStore.deleteItemAsync('refreshToken'),
      ]);
      dispatch({ type: 'SIGN_OUT' });
    },
  }), []);

  return (
    <AuthContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AuthContext.Provider>
  );
}
