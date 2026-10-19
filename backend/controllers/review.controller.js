import Review from '../models/review.model.js';

export async function listMovieReviews(request, response) {
  const reviews = await Review.find({ movie: request.params.movieId })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .lean();
  return response.json({ success: true, reviews });
}

export async function createReview(request, response) {
  const { rating, comment } = request.body || {};
  if (!Number.isFinite(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || !comment?.trim()) {
    return response.status(400).json({ success: false, message: 'Rating from 1 to 5 and a comment are required' });
  }

  try {
    const review = await Review.create({ user: request.user.userId, movie: request.params.movieId, rating: Number(rating), comment: comment.trim() });
    return response.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ success: false, message: 'You have already reviewed this movie' });
    throw error;
  }
}

export async function deleteReview(request, response) {
  const filter = request.user.role === 'admin'
    ? { _id: request.params.reviewId }
    : { _id: request.params.reviewId, user: request.user.userId };
  const review = await Review.findOneAndDelete(filter);
  if (!review) return response.status(404).json({ success: false, message: 'Review not found' });
  return response.json({ success: true, message: 'Review deleted' });
}
