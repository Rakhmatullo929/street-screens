import { useEffect, useReducer, useCallback, useMemo } from 'react';

import { AuthContext } from './auth-context';
import { isValidToken, setSession } from './utils';
import { authService } from './auth-service';
import { ActionMapType, AuthStateType, AuthUserType } from '../../types';

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

const initialState: AuthStateType = {
  user: null,
  loading: true,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN || action.type === Types.REGISTER) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

const STORAGE_KEY = 'accessToken';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  
  const dispatchUser = useCallback((type: Types, user: AuthUserType) => {
    dispatch({ type, payload: { user } });
  }, []);

  const initialize = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);
        const user = await authService.getCurrentUser();
        dispatchUser(Types.INITIAL, user);
      } else {
        dispatchUser(Types.INITIAL, null);
      }
    } catch (error) {
      console.error(error);
      dispatchUser(Types.INITIAL, null);
    }
  }, [dispatchUser]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { access, user } = await authService.login({ email, password });
        setSession(access);
        dispatchUser(Types.LOGIN, user);
      } catch (error) {
        console.error('Login failed:', error);
        
        setSession(null);
        throw error; 
      }
    },
    [dispatchUser]
  );

  
  const register = useCallback(
    async (
      email: string,
      password: string,
      typeUser?: string,
      password2: string = password 
    ) => {
      try {
        const { access, user } = await authService.register({
          email,
          password,
          password2,
          typeUser,
        });
        setSession(access);
        dispatchUser(Types.REGISTER, user);
      } catch (error) {
        console.error('Registration failed:', error);
        
        setSession(null);
        throw error; 
      }
    },
    [dispatchUser]
  );

  
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setSession(null);
      dispatch({
        type: Types.LOGOUT,
      });
    }
  }, []);

  

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      
      login,
      register,
      logout,
    }),
    [login, logout, register, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
