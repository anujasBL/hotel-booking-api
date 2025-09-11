import { Request, Response } from 'express';
import { logger } from '../config/logger';
import bookingService from '../services/bookingService';
import { ApiResponse } from '../types';
import { CreateBookingInput, UpdateBookingInput, AvailabilityCheckInput } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Hotel booking management endpoints
 */

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Room not available
 */
export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const bookingData = req.body as CreateBookingInput;
  
  logger.info('Create booking request:', { 
    userId, 
    hotelId: bookingData.hotelId,
    checkIn: bookingData.checkInDate,
    checkOut: bookingData.checkOutDate,
  });

  const booking = await bookingService.createBooking(userId, bookingData);

  const response: ApiResponse = {
    success: true,
    data: booking,
    message: 'Booking created successfully',
  };

  res.status(201).json(response);
});

/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [pending, confirmed, cancelled, completed, no_show]
 *         description: Filter by booking status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [checkInDate, bookingDate, total]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
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
 *                     bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 */
export const getUserBookings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const filters = req.query as any;
  
  logger.info('Get user bookings request:', { userId, page, limit });

  const result = await bookingService.getUserBookings(userId, filters, page, limit);

  const response: ApiResponse = {
    success: true,
    data: result,
    message: `Retrieved ${result.bookings.length} bookings`,
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get booking details
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 *       404:
 *         description: Booking not found
 *       403:
 *         description: Access denied
 */
export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  
  logger.info('Get booking by ID request:', { bookingId: id, userId });

  const booking = await bookingService.getBookingById(id, userId);

  const response: ApiResponse = {
    success: true,
    data: booking,
    message: 'Booking retrieved successfully',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   put:
 *     summary: Update booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookingRequest'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       404:
 *         description: Booking not found
 *       403:
 *         description: Access denied
 *       409:
 *         description: Cannot modify booking in current status
 */
export const updateBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const updateData = req.body as UpdateBookingInput;
  
  logger.info('Update booking request:', { bookingId: id, userId, updateData });

  const booking = await bookingService.updateBooking(id, userId, updateData);

  const response: ApiResponse = {
    success: true,
    data: booking,
    message: 'Booking updated successfully',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/bookings/{id}/cancel:
 *   post:
 *     summary: Cancel booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Cancellation reason
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       404:
 *         description: Booking not found
 *       403:
 *         description: Access denied
 *       409:
 *         description: Cannot cancel booking in current status
 */
export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const { reason } = req.body;
  
  logger.info('Cancel booking request:', { bookingId: id, userId, reason });

  const booking = await bookingService.cancelBooking(id, userId, reason);

  const response: ApiResponse = {
    success: true,
    data: booking,
    message: 'Booking cancelled successfully',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/bookings/availability/check:
 *   post:
 *     summary: Check room availability
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AvailabilityCheckRequest'
 *     responses:
 *       200:
 *         description: Availability check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AvailabilityResult'
 */
export const checkAvailability = asyncHandler(async (req: Request, res: Response) => {
  const availabilityData = req.body as AvailabilityCheckInput;
  
  logger.info('Check availability request:', { 
    hotelId: availabilityData.hotelId,
    roomId: availabilityData.roomId,
    checkIn: availabilityData.checkInDate,
    checkOut: availabilityData.checkOutDate,
  });

  const availability = await bookingService.checkAvailability(availabilityData);

  const response: ApiResponse = {
    success: true,
    data: availability,
    message: availability.isAvailable 
      ? 'Rooms are available for the selected dates'
      : 'No rooms available for the selected dates',
  };

  res.json(response);
});

export default {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  checkAvailability,
};
