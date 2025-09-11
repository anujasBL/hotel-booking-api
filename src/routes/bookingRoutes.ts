import { Router } from 'express';
import bookingController from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  createBookingSchema, 
  updateBookingSchema, 
  bookingSearchSchema,
  availabilityCheckSchema,
  uuidParamSchema,
  paginationSchema 
} from '../utils/validation';

const router = Router();

/**
 * @route POST /api/v1/bookings
 * @desc Create a new booking
 * @access Private
 */
router.post(
  '/',
  authenticate,
  validate({ body: createBookingSchema }),
  bookingController.createBooking
);

/**
 * @route GET /api/v1/bookings
 * @desc Get user's bookings
 * @access Private
 */
router.get(
  '/',
  authenticate,
  validate({ query: bookingSearchSchema }),
  bookingController.getUserBookings
);

/**
 * @route GET /api/v1/bookings/:id
 * @desc Get booking details
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  validate({ params: uuidParamSchema }),
  bookingController.getBookingById
);

/**
 * @route PUT /api/v1/bookings/:id
 * @desc Update booking
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  validate({ 
    params: uuidParamSchema, 
    body: updateBookingSchema 
  }),
  bookingController.updateBooking
);

/**
 * @route POST /api/v1/bookings/:id/cancel
 * @desc Cancel booking
 * @access Private
 */
router.post(
  '/:id/cancel',
  authenticate,
  validate({ params: uuidParamSchema }),
  bookingController.cancelBooking
);

/**
 * @route POST /api/v1/bookings/availability/check
 * @desc Check room availability
 * @access Public
 */
router.post(
  '/availability/check',
  validate({ body: availabilityCheckSchema }),
  bookingController.checkAvailability
);

export default router;
