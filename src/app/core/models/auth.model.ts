export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password: string;
  role?: 'customer' | 'admin';
}

export type LoginResponse =
  | { token: string; user: User }
  | { success: boolean; message: string; data: { token: string; user: User } };

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  role: 'admin' | 'customer';
  created_at?: string;
  updated_at?: string;
  profileImage?: string;
}

export interface RecoveryPasswordRequest {
  email: string;
}

export interface RecoveryPasswordResponse {
  success: boolean;
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
