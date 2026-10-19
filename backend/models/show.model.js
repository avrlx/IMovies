import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true },
    screen: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    ticketPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

showSchema.index({ theatre: 1, screen: 1, date: 1, startTime: 1 });
showSchema.index({ movie: 1, date: 1 });

export default mongoose.model('Show', showSchema);
