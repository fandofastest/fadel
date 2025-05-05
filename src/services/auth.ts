import { User } from '@/types/User';
import { API_URL } from '@/config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Attempting login to:', `${API_URL}/auth/login`);
    console.log('With credentials:', { ...credentials, password: '***' });

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const error = await response.json();
        console.error('Login error response:', error);
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login success data:', { 
        ...data, 
        accessToken: data.accessToken ? '***' : null,
        refreshToken: data.refreshToken ? '***' : null 
      });
      
      if (!data.accessToken) {
        console.error('No access token received in response');
        throw new Error('No access token received');
      }

      // Simpan token di localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Set cookie untuk middleware
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=3600`; // 1 jam
      document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=604800`; // 1 minggu

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('Attempting registration to:', `${API_URL}/auth/register`);
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    console.log('Register response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Register error response:', error);
      throw new Error(error.message || 'Registration failed');
    }

    const result = await response.json();
    console.log('Register success data:', { 
      ...result, 
      accessToken: result.accessToken ? '***' : null,
      refreshToken: result.refreshToken ? '***' : null 
    });

    // Simpan token di localStorage
    if (result.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);

      // Set cookie untuk middleware
      document.cookie = `accessToken=${result.accessToken}; path=/; max-age=3600`; // 1 jam
      document.cookie = `refreshToken=${result.refreshToken}; path=/; max-age=604800`; // 1 minggu
    }

    return result;
  },

  async logout(): Promise<void> {
    console.log('Attempting logout');
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      credentials: 'include',
    });

    // Hapus token dari localStorage dan cookie
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    console.log('Logout completed');
  },

  async getCurrentUser(): Promise<User> {
    console.log('Attempting to get current user');
    const response = await fetch(`${API_URL}/profile/me`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      credentials: 'include',
    });

    console.log('Get current user response status:', response.status);

    if (!response.ok) {
      console.error('Failed to get current user');
      throw new Error('Failed to get current user');
    }

    const user = await response.json();
    console.log('Current user data:', user);
    return user;
  },

  // Helper untuk mengecek apakah user sudah login
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    console.log('Checking authentication status:', !!token);
    return !!token;
  },

  // Helper untuk mendapatkan token
  getToken(): string | null {
    const token = localStorage.getItem('accessToken');
    console.log('Getting token:', token ? '***' : null);
    return token;
  },
}; 