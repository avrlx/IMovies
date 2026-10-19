import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    selectedSeats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true }],
    amount: { type: Number, required: true, min: 0 },
    bookingStatus: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    holdExpiresAt: { type: Date },
    bookingTimestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

bookingSchema.index({ user: 1, bookingTimestamp: -1 });
bookingSchema.index({ show: 1, bookingStatus: 1 });

export default mongoose.model('Booking', bookingSchema);
