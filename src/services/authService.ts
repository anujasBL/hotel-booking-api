import jwt from 'jsonwebtoken';
import { supabase, supabaseAnon } from '../config/database';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  AuthResponse, 
  LoginCredentials 
} from '../models/User';
import { JwtPayload } from '../types';
import { AppError, createUnauthorizedError, createConflictError, createNotFoundError } from '../middleware/errorHandler';

export class AuthService {
  /**
   * Register a new user
   */
  async register(userData: CreateUserData): Promise<AuthResponse> {
    try {
      logger.info('Attempting user registration:', { email: userData.email });

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone_number: userData.phoneNumber,
            date_of_birth: userData.dateOfBirth?.toISOString(),
          },
        },
      });

      if (authError) {
        logger.error('Supabase registration failed:', authError);
        
        if (authError.message.includes('already registered')) {
          throw createConflictError('User with this email already exists');
        }
        
        throw new AppError(`Registration failed: ${authError.message}`, 400, 'REGISTRATION_FAILED');
      }

      if (!authData.user || !authData.session) {
        throw new AppError('Registration failed: No user or session returned', 400, 'REGISTRATION_FAILED');
      }

      // Create user profile in our database
      const userProfile = {
        id: authData.user.id,
        email: authData.user.email!,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone_number: userData.phoneNumber,
        date_of_birth: userData.dateOfBirth?.toISOString(),
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(userProfile);

      if (profileError) {
        logger.error('Failed to create user profile:', profileError);
        // Try to clean up the auth user if profile creation fails
        await supabaseAnon.auth.admin.deleteUser(authData.user.id);
        throw new AppError('Registration failed: Could not create user profile', 500, 'PROFILE_CREATION_FAILED');
      }

      // Generate our own JWT token
      const accessToken = this.generateAccessToken({
        userId: authData.user.id,
        email: authData.user.email!,
      });

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth,
        createdAt: new Date(authData.user.created_at),
        updatedAt: new Date(),
      };

      logger.info('User registered successfully:', { 
        userId: authData.user.id, 
        email: authData.user.email 
      });

      return {
        user,
        accessToken,
        refreshToken: authData.session.refresh_token!,
      };
    } catch (error) {
      logger.error('Registration failed:', { email: userData.email, error });
      throw error instanceof AppError ? error : new AppError('Registration failed', 500);
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      logger.info('Attempting user login:', { email: credentials.email });

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        logger.error('Supabase login failed:', authError);
        throw createUnauthorizedError('Invalid email or password');
      }

      if (!authData.user || !authData.session) {
        throw createUnauthorizedError('Login failed: No user or session returned');
      }

      // Get user profile from our database
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !userProfile) {
        logger.error('Failed to get user profile:', profileError);
        throw createNotFoundError('User profile');
      }

      // Generate our own JWT token
      const accessToken = this.generateAccessToken({
        userId: authData.user.id,
        email: authData.user.email!,
      });

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        phoneNumber: userProfile.phone_number,
        dateOfBirth: userProfile.date_of_birth ? new Date(userProfile.date_of_birth) : undefined,
        createdAt: new Date(authData.user.created_at),
        updatedAt: new Date(userProfile.updated_at),
      };

      logger.info('User logged in successfully:', { 
        userId: authData.user.id, 
        email: authData.user.email 
      });

      return {
        user,
        accessToken,
        refreshToken: authData.session.refresh_token!,
      };
    } catch (error) {
      logger.error('Login failed:', { email: credentials.email, error });
      throw error instanceof AppError ? error : new AppError('Login failed', 500);
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<void> {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.warn('Supabase logout failed:', error);
        // Don't throw error for logout failures, just log them
      }

      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed:', error);
      // Don't throw error for logout failures
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { data: authData, error } = await supabaseAnon.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !authData.session || !authData.user) {
        throw createUnauthorizedError('Invalid refresh token');
      }

      const accessToken = this.generateAccessToken({
        userId: authData.user.id,
        email: authData.user.email!,
      });

      logger.info('Token refreshed successfully:', { userId: authData.user.id });

      return {
        accessToken,
        refreshToken: authData.session.refresh_token!,
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error instanceof AppError ? error : new AppError('Token refresh failed', 401);
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<User> {
    try {
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !userProfile) {
        throw createNotFoundError('User profile');
      }

      const user: User = {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        phoneNumber: userProfile.phone_number,
        dateOfBirth: userProfile.date_of_birth ? new Date(userProfile.date_of_birth) : undefined,
        createdAt: new Date(userProfile.created_at),
        updatedAt: new Date(userProfile.updated_at),
      };

      return user;
    } catch (error) {
      logger.error('Failed to get user profile:', { userId, error });
      throw error instanceof AppError ? error : new AppError('Failed to get user profile', 500);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updateData: UpdateUserData): Promise<User> {
    try {
      const updateFields = {
        first_name: updateData.firstName,
        last_name: updateData.lastName,
        phone_number: updateData.phoneNumber,
        date_of_birth: updateData.dateOfBirth?.toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Remove undefined fields
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key as keyof typeof updateFields] === undefined) {
          delete updateFields[key as keyof typeof updateFields];
        }
      });

      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update(updateFields)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update user profile:', error);
        throw new AppError('Failed to update user profile', 500, 'UPDATE_FAILED');
      }

      const user: User = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        firstName: updatedProfile.first_name,
        lastName: updatedProfile.last_name,
        phoneNumber: updatedProfile.phone_number,
        dateOfBirth: updatedProfile.date_of_birth ? new Date(updatedProfile.date_of_birth) : undefined,
        createdAt: new Date(updatedProfile.created_at),
        updatedAt: new Date(updatedProfile.updated_at),
      };

      logger.info('User profile updated successfully:', { userId });

      return user;
    } catch (error) {
      logger.error('Failed to update user profile:', { userId, error });
      throw error instanceof AppError ? error : new AppError('Failed to update user profile', 500);
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // First verify the current password by attempting to sign in
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (!userProfile) {
        throw createNotFoundError('User');
      }

      // Verify current password
      const { error: signInError } = await supabaseAnon.auth.signInWithPassword({
        email: userProfile.email,
        password: currentPassword,
      });

      if (signInError) {
        throw createUnauthorizedError('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        logger.error('Failed to update password:', updateError);
        throw new AppError('Failed to update password', 500, 'PASSWORD_UPDATE_FAILED');
      }

      logger.info('Password changed successfully:', { userId });
    } catch (error) {
      logger.error('Password change failed:', { userId, error });
      throw error instanceof AppError ? error : new AppError('Failed to change password', 500);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
        redirectTo: `${config.app.frontendUrl}/reset-password`,
      });

      if (error) {
        logger.error('Password reset request failed:', error);
        throw new AppError('Failed to send password reset email', 500, 'PASSWORD_RESET_FAILED');
      }

      logger.info('Password reset email sent:', { email });
    } catch (error) {
      logger.error('Password reset request failed:', { email, error });
      throw error instanceof AppError ? error : new AppError('Failed to request password reset', 500);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const { error } = await supabaseAnon.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        logger.error('Email verification failed:', error);
        throw createUnauthorizedError('Invalid or expired verification token');
      }

      logger.info('Email verified successfully');
    } catch (error) {
      logger.error('Email verification failed:', { token, error });
      throw error instanceof AppError ? error : new AppError('Email verification failed', 500);
    }
  }

  /**
   * Generate JWT access token
   */
  private generateAccessToken(payload: { userId: string; email: string }): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
      },
      config.jwt.secret,
      {
        expiresIn: '24h',
        issuer: 'hotel-booking-api',
        audience: 'hotel-booking-app',
      }
    );
  }

  /**
   * Validate JWT token
   */
  validateToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw createUnauthorizedError('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw createUnauthorizedError('Invalid token');
      }
      throw createUnauthorizedError('Token validation failed');
    }
  }
}

export default new AuthService();
