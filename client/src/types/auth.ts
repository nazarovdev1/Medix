export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export type UserRole = 'admin' | 'doctor' | 'patient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
