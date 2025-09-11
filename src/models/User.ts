import { z } from 'zod';

// Base User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User creation data (for registration)
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
}

// User update data
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
}

// User authentication response
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// User login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

export default User;
