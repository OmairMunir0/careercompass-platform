export interface AuthResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  passwordHash?: string;
  [key: string]: any;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  companyName?: string;
  companyWebsite?: string;
  position?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
