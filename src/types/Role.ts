export type Permission = 
  | 'manage_users'
  | 'manage_exams'
  | 'manage_questions'
  | 'view_results'
  | 'take_exams'
  | 'view_own_results';

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: Permission[];
}

export interface RoleResponse {
  message?: string;
  error?: string;
  errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
  data?: Role | Role[];
} 