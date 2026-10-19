import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
  },
  { _id: true },
);

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    screens: { type: [screenSchema], required: true, default: [] },
  },
  { timestamps: true },
);

theatreSchema.index({ location: 1, name: 1 });

export default mongoose.model('Theatre', theatreSchema);
