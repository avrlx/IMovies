import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    genre: { type: [String], required: true, default: [] },
    language: { type: String, required: true, trim: true },
    cast: { type: [String], default: [] },
    duration: { type: Number, min: 1 },
    releaseDate: { type: Date, required: true },
    poster: { type: String, trim: true },
    rating: { type: Number, min: 0, max: 10, default: 0 },
    status: { type: String, enum: ['upcoming', 'now_showing', 'ended'], default: 'upcoming' },
    tmdbId: { type: Number, min: 1 },
  },
  // Index changes are applied explicitly after MongoDB connections are ready.
  { timestamps: true, autoIndex: false },
);

movieSchema.index({ status: 1, releaseDate: 1 });
movieSchema.index({ tmdbId: 1 }, { unique: true, sparse: true });
// `language` is already a movie field (e.g. Hindi/English). Do not let MongoDB
// mistake it for the text index language override.
movieSchema.index(
  { title: 'text', description: 'text' },
  { language_override: 'textIndexLanguage' },
);

export default mongoose.model('Movie', movieSchema);
