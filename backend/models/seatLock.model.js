import mongoose from 'mongoose';

const seatLockSchema = new mongoose.Schema(
  {
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    seat: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

seatLockSchema.index({ show: 1, seat: 1 }, { unique: true });

export default mongoose.model('SeatLock', seatLockSchema);
