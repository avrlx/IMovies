import { Router } from 'express';
import { cancelBooking, createBooking, getMyBooking, listAllBookings, listMyBookings, listShowSeats, payForBooking } from '../controllers/booking.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorization.middleware.js';

const router = Router();
router.get('/shows/:showId/seats', asyncHandler(listShowSeats));
router.use(authenticate);
router.post('/', asyncHandler(createBooking));
router.get('/', authorize('admin'), asyncHandler(listAllBookings));
router.get('/mine', asyncHandler(listMyBookings));
router.post('/:bookingId/pay', asyncHandler(payForBooking));
router.get('/:bookingId', asyncHandler(getMyBooking));
router.patch('/:bookingId/cancel', asyncHandler(cancelBooking));
export default router;
