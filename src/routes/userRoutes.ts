import { Router } from 'express';
import userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  registerUserSchema, 
  loginUserSchema, 
  updateUserSchema 
} from '../utils/validation';
import { z } from 'zod';

const router = Router();

/**
 * @route POST /api/v1/users/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  validate({ body: registerUserSchema }),
  userController.register
);

/**
 * @route POST /api/v1/users/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  validate({ body: loginUserSchema }),
  userController.login
);

/**
 * @route POST /api/v1/users/logout
 * @desc Logout user
 * @access Private
 */
router.post(
  '/logout',
  authenticate,
  userController.logout
);

/**
 * @route POST /api/v1/users/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh-token',
  validate({ 
    body: z.object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    })
  }),
  userController.refreshToken
);

/**
 * @route GET /api/v1/users/profile
 * @desc Get user profile
 * @access Private
 */
router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

/**
 * @route PUT /api/v1/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put(
  '/profile',
  authenticate,
  validate({ body: updateUserSchema }),
  userController.updateProfile
);

/**
 * @route POST /api/v1/users/change-password
 * @desc Change user password
 * @access Private
 */
router.post(
  '/change-password',
  authenticate,
  validate({
    body: z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    })
  }),
  userController.changePassword
);

/**
 * @route POST /api/v1/users/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/forgot-password',
  validate({
    body: z.object({
      email: z.string().email('Valid email is required'),
    })
  }),
  userController.forgotPassword
);

/**
 * @route POST /api/v1/users/verify-email
 * @desc Verify email address
 * @access Public
 */
router.post(
  '/verify-email',
  validate({
    body: z.object({
      token: z.string().min(1, 'Verification token is required'),
    })
  }),
  userController.verifyEmail
);

export default router;
