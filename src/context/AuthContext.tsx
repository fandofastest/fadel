'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/User';
import { authService } from '@/services/auth';
import { userService, UserProfile } from '@/services/user';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        console.log('Checking auth on mount...');
        const token = localStorage.getItem('accessToken');
        console.log('Token found:', !!token);
        
        if (token) {
          console.log('Token exists, fetching user data...');
          const currentUser = await authService.getCurrentUser();
          console.log('User data fetched:', currentUser);
          setUser(currentUser);

          // Fetch user profile
          console.log('Fetching user profile...');
          const userProfile = await userService.getProfile();
          console.log('User profile fetched:', userProfile);
          setProfile(userProfile);
        } else {
          console.log('No token found, user is not authenticated');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login process...');
      const response = await authService.login({ email, password });
      console.log('Login response received:', response);
      
      if (response.accessToken) {
        console.log('Token received, saving to localStorage');
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        setUser(response.user);

        // Fetch user profile after successful login
        console.log('Fetching user profile after login...');
        const userProfile = await userService.getProfile();
        console.log('User profile fetched:', userProfile);
        setProfile(userProfile);

        console.log('Login process completed successfully');
      } else {
        console.error('No token in response');
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Login process failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setProfile(null);
      throw error;
    }
  };

  const register = async (email: string, password: string, role: string) => {
    try {
      console.log('Starting registration process...');
      const response = await authService.register({ email, password, role });
      console.log('Registration response received:', response);
      
      if (response.accessToken) {
        console.log('Token received, saving to localStorage');
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        setUser(response.user);

        // Fetch user profile after successful registration
        console.log('Fetching user profile after registration...');
        const userProfile = await userService.getProfile();
        console.log('User profile fetched:', userProfile);
        setProfile(userProfile);

        console.log('Registration process completed successfully');
      } else {
        console.error('No token in response');
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Registration process failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setProfile(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Starting logout process...');
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      console.log('Clearing auth data');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setProfile(null);
      console.log('Logout process completed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 