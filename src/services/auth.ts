import axios from 'axios';

const API_PREFIX = '/api';

export const authService = {
  async register(userData: { name: string; email: string; password: string; phone: string; role?: string }) {
    const response = await axios.post(`${API_PREFIX}/auth/register`, userData);
    return response.data;
  },

  async login(credentials: { email: string; password: string }) {
    const response = await axios.post(`${API_PREFIX}/auth/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  },

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  async getUserProfile() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await axios.get(`${API_PREFIX}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error) {
      this.logout();
      return null;
    }
  },

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const user = this.getCurrentUser();
      if (!user) return false;

      // Check if token is expired
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return decodedToken.exp > currentTime;
    } catch (error) {
      return false;
    }
  },
};
