import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    screen: { type: mongoose.Schema.Types.ObjectId, required: true },
    seatNumber: { type: String, required: true, trim: true },
    row: { type: String, required: true, trim: true },
    type: { type: String, enum: ['regular', 'premium', 'vip'], default: 'regular' },
    status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  },
  { timestamps: true },
);

seatSchema.index({ theatre: 1, screen: 1, seatNumber: 1 }, { unique: true });

export default mongoose.model('Seat', seatSchema);
