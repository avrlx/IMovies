import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import Seat from '../models/seat.model.js';
import SeatLock from '../models/seatLock.model.js';
import Show from '../models/show.model.js';

const LOCK_DURATION_MS = 10 * 60 * 1000;

async function getShowSeats(showId) {
  const show = await Show.findById(showId).lean();
  if (!show) return null;
  const seats = await Seat.find({ theatre: show.theatre, screen: show.screen, status: 'available' }).sort({ row: 1, seatNumber: 1 }).lean();
  const now = new Date();
  const [locks, bookings] = await Promise.all([
    SeatLock.find({ show: showId, expiresAt: { $gt: now } }).select('seat').lean(),
    Booking.find({ show: showId, bookingStatus: { $in: ['pending', 'confirmed'] } }).select('selectedSeats bookingStatus').lean(),
  ]);
  const locked = new Set(locks.map((lock) => lock.seat.toString()));
  const booked = new Set(bookings.filter((booking) => booking.bookingStatus === 'confirmed').flatMap((booking) => booking.selectedSeats.map((seat) => seat.toString())));
  return { show, seats: seats.map((seat) => ({ ...seat, availability: booked.has(seat._id.toString()) ? 'booked' : locked.has(seat._id.toString()) ? 'locked' : 'available' })) };
}

export async function listShowSeats(request, response) {
  const result = await getShowSeats(request.params.showId);
  if (!result) return response.status(404).json({ success: false, message: 'Show not found' });
  return response.json({ success: true, showId: request.params.showId, seats: result.seats });
}

export async function createBooking(request, response) {
  const { showId, seatIds } = request.body || {};
  if (!mongoose.isValidObjectId(showId) || !Array.isArray(seatIds) || seatIds.length === 0 || new Set(seatIds).size !== seatIds.length || seatIds.some((id) => !mongoose.isValidObjectId(id))) {
    return response.status(400).json({ success: false, message: 'A valid showId and one or more unique seatIds are required' });
  }

  const show = await Show.findById(showId).lean();
  if (!show) return response.status(404).json({ success: false, message: 'Show not found' });
  const seats = await Seat.find({ _id: { $in: seatIds }, theatre: show.theatre, screen: show.screen, status: 'available' }).lean();
  if (seats.length !== seatIds.length) return response.status(409).json({ success: false, message: 'One or more seats are not available for this show' });

  const alreadyBooked = await Booking.exists({ show: showId, bookingStatus: 'confirmed', selectedSeats: { $in: seatIds } });
  if (alreadyBooked) return response.status(409).json({ success: false, message: 'One or more seats have already been booked' });

  const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);
  await SeatLock.deleteMany({ show: showId, seat: { $in: seatIds }, expiresAt: { $lte: new Date() } });
  const insertedLockIds = [];
  try {
    for (const seat of seatIds) {
      const [lock] = await SeatLock.create([{ show: showId, seat, user: request.user.userId, expiresAt }]);
      insertedLockIds.push(lock._id);
    }
    const booking = await Booking.create({
      user: request.user.userId,
      show: showId,
      selectedSeats: seatIds,
      amount: show.ticketPrice * seatIds.length,
      holdExpiresAt: expiresAt,
    });
    return response.status(201).json({ success: true, message: 'Seats temporarily reserved for 10 minutes', booking, lockExpiresAt: expiresAt });
  } catch (error) {
    if (insertedLockIds.length) await SeatLock.deleteMany({ _id: { $in: insertedLockIds } });
    if (error.code === 11000) return response.status(409).json({ success: false, message: 'One or more seats were just selected by another user' });
    throw error;
  }
}

export async function listMyBookings(request, response) {
  const bookings = await Booking.find({ user: request.user.userId })
    .populate({ path: 'show', populate: [{ path: 'movie', select: 'title poster genre' }, { path: 'theatre', select: 'name location' }] })
    .populate('selectedSeats', 'seatNumber row type')
    .sort({ bookingTimestamp: -1 })
    .lean();
  return response.json({ success: true, bookings });
}

export async function listAllBookings(_request, response) {
  const bookings = await Booking.find({})
    .populate('user', 'name email')
    .populate({ path: 'show', populate: [{ path: 'movie', select: 'title poster' }, { path: 'theatre', select: 'name location' }] })
    .populate('selectedSeats', 'seatNumber row type')
    .sort({ bookingTimestamp: -1 })
    .lean();
  return response.json({ success: true, bookings });
}

export async function getMyBooking(request, response) {
  const booking = await Booking.findOne({ _id: request.params.bookingId, user: request.user.userId })
    .populate({ path: 'show', populate: [{ path: 'movie', select: 'title poster genre' }, { path: 'theatre', select: 'name location address' }] })
    .populate('selectedSeats', 'seatNumber row type')
    .lean();
  if (!booking) return response.status(404).json({ success: false, message: 'Booking not found' });
  const payment = await Payment.findOne({ booking: booking._id }).lean();
  return response.json({ success: true, booking, payment });
}

export async function payForBooking(request, response) {
  const allowedMethods = ['card', 'upi', 'net_banking', 'wallet'];
  const { paymentMethod } = request.body || {};
  if (!allowedMethods.includes(paymentMethod)) return response.status(400).json({ success: false, message: 'Choose a valid payment method' });

  const booking = await Booking.findOne({ _id: request.params.bookingId, user: request.user.userId });
  if (!booking) return response.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.bookingStatus === 'cancelled') return response.status(409).json({ success: false, message: 'This reservation has been cancelled' });

  const existingPayment = await Payment.findOne({ booking: booking._id });
  if (booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'paid') {
    return response.json({ success: true, booking, payment: existingPayment });
  }
  if (!booking.holdExpiresAt || booking.holdExpiresAt <= new Date()) {
    return response.status(409).json({ success: false, message: 'This seat hold has expired. Please choose seats again.' });
  }

  const payment = existingPayment || await Payment.create({
    booking: booking._id,
    amount: booking.amount,
    transactionId: `IMV-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`,
    status: 'completed',
    paymentMethod,
  });
  booking.bookingStatus = 'confirmed';
  booking.paymentStatus = 'paid';
  await booking.save();
  await SeatLock.deleteMany({ show: booking.show, user: request.user.userId, seat: { $in: booking.selectedSeats } });
  return response.json({ success: true, booking, payment });
}

export async function cancelBooking(request, response) {
  const booking = await Booking.findOneAndUpdate(
    { _id: request.params.bookingId, user: request.user.userId, bookingStatus: 'pending' },
    { bookingStatus: 'cancelled' },
    { new: true },
  );
  if (!booking) return response.status(404).json({ success: false, message: 'Pending booking not found' });
  await SeatLock.deleteMany({ show: booking.show, user: request.user.userId, seat: { $in: booking.selectedSeats } });
  return response.json({ success: true, booking });
}
