import { Request, Response } from 'express';
import { logger } from '../config/logger';
import authService from '../services/authService';
import { ApiResponse } from '../types';
import { RegisterUserInput, LoginUserInput, UpdateUserInput } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication and profile management endpoints
 */

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: User already exists
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const userData = req.body as RegisterUserInput;
  
  logger.info('User registration request:', { email: userData.email });

  const authResponse = await authService.register(userData);

  const response: ApiResponse = {
    success: true,
    data: authResponse,
    message: 'User registered successfully',
  };

  res.status(201).json(response);
});

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserRequest'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const credentials = req.body as LoginUserInput;
  
  logger.info('User login request:', { email: credentials.email });

  const authResponse = await authService.login(credentials);

  const response: ApiResponse = {
    success: true,
    data: authResponse,
    message: 'User logged in successfully',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  
  logger.info('User logout request:', { userId: req.user?.userId });

  await authService.logout(token);

  const response: ApiResponse = {
    success: true,
    message: 'User logged out successfully',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Invalid refresh token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: refreshTokenValue } = req.body;
  
  logger.info('Token refresh request');

  const tokens = await authService.refreshToken(refreshTokenValue);

  const response: ApiResponse = {
    success: true,
    data: tokens,
    message: 'Token refreshed successfully',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  
  logger.info('Get profile request:', { userId });

  const user = await authService.getUserProfile(userId);

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'Profile retrieved successfully',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const updateData = req.body as UpdateUserInput;
  
  logger.info('Update profile request:', { userId });

  const user = await authService.updateUserProfile(userId, updateData);

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'Profile updated successfully',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 description: New password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Invalid current password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;
  
  logger.info('Change password request:', { userId });

  await authService.changePassword(userId, currentPassword, newPassword);

  const response: ApiResponse = {
    success: true,
    message: 'Password changed successfully',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/users/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  logger.info('Forgot password request:', { email });

  await authService.requestPasswordReset(email);

  const response: ApiResponse = {
    success: true,
    message: 'Password reset email sent if account exists',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/users/verify-email:
 *   post:
 *     summary: Verify email address
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       401:
 *         description: Invalid or expired token
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  
  logger.info('Verify email request');

  await authService.verifyEmail(token);

  const response: ApiResponse = {
    success: true,
    message: 'Email verified successfully',
  };

  res.json(response);
});

export default {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyEmail,
};
