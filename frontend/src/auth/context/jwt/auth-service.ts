import { request } from 'src/utils/base-axios';
import { API_ENDPOINTS } from 'src/utils/axios';
import { AuthUserType } from '../../types';

export const formatUserData = (userData: any): AuthUserType => {
  if (!userData) return null;

  const displayName = userData.email || userData.username || 'Unknown User';

  return {
    ...userData,
    displayName,
  };
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  password2: string;
  typeUser?: string;
}

export interface AuthResponse {
  access: string;
  user: any;
}

export const authService = {
  
  async getCurrentUser() {
    const userData = await request({
      url: API_ENDPOINTS.auth.me,
      method: 'GET',
    });

    if (!userData) {
      throw new Error('Failed to fetch user data');
    }

    return formatUserData(userData);
  },

  
  async updateUser(userData: any) {
    const response = await request({
      url: API_ENDPOINTS.auth.updateUser,
      method: 'PATCH',
      data: userData,
    });

    if (!response) {
      throw new Error('Failed to update user data');
    }

    return formatUserData(response);
  },

  
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await request(
      {
        url: API_ENDPOINTS.auth.login,
        method: 'POST',
        data: credentials,
      },
      true 
    );

    
    if (!response || !response.access) {
      throw new Error('Invalid login response: missing access token');
    }

    if (!response.user) {
      throw new Error('Invalid login response: missing user data');
    }

    return {
      access: response.access,
      user: formatUserData(response.user),
    };
  },

  
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { email, password, password2, typeUser } = credentials;

    const response = await request(
      {
        url: API_ENDPOINTS.auth.register,
        method: 'POST',
        data: {
          email,
          password1: password,
          password2,
          ...(typeUser && { type_user: typeUser }),
        },
      },
      true 
    );

    
    if (!response || !response.access) {
      throw new Error('Invalid registration response: missing access token');
    }

    if (!response.user) {
      throw new Error('Invalid registration response: missing user data');
    }

    return {
      access: response.access,
      user: formatUserData(response.user),
    };
  },

  
  async logout(): Promise<void> {
    await request({
      url: API_ENDPOINTS.auth.logout,
      method: 'POST',
    });
  },
};

