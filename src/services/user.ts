import axios from 'axios';

const API_PREFIX = '/api';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const userService = {
  async getProfile(token: string): Promise<UserProfile> {
    const response = await axios.get(`${API_PREFIX}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.user;
  },

  async updateProfile(userId: string, userData: Partial<UserProfile>, token: string): Promise<UserProfile> {
    const response = await axios.put(
      `${API_PREFIX}/users/${userId}`,
      userData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.user;
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    token: string
  ): Promise<void> {
    await axios.put(
      `${API_PREFIX}/users/${userId}/password`,
      { currentPassword, newPassword },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Add more user-related methods as needed
};

// For backward compatibility
export default userService;
