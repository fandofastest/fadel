import { authService } from './auth';
import { API_URL } from '@/config/api';

export interface UserProfile {
  id: string;
  email: string;
  role: {
    _id: string;
    name: string;
    permissions: string[];
  };
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    dateOfBirth: string;
    gender: string;
    avatar: string | null;
    bio: string;
  };
  preferences: {
    language: string;
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
}

class UserService {
  private baseUrl = API_URL;

  async getProfile(): Promise<UserProfile> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/profile/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data: UserProfileResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 