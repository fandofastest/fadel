import { API_URL } from '@/config/api';
import { handleApiError } from '@/utils/apiError';
import type { RoleUser } from '@/types/RoleUser';

export const roleService = {
  async getAllRoles(): Promise<RoleUser[]> {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      // API returns array directly
      const data: RoleUser[] = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getRoleById(id: string): Promise<RoleUser> {
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: RoleUser = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async createRole(roleData: Omit<RoleUser, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<RoleUser> {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: RoleUser = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async updateRole(id: string, roleData: Partial<RoleUser>): Promise<RoleUser> {
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: RoleUser = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async deleteRole(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      throw error;
    }
  },
}; 