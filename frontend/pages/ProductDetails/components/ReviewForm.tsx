import React, { useState } from 'react';
import { Star, Loader } from 'lucide-react';
import { useApp } from '../../../store/Context'; // Adjust path as necessary
import { useNotifications } from '../../../store/NotificationContext'; // Adjust path as necessary
import API from '../../../services/api'; // Corrected: Import API as default
import { Review } from '../../../../types'; // Adjust path as necessary

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: (review: Review) => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
  const { user } = useApp();
  const { showToast } = useNotifications();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast({ _id: Date.now().toString(), recipient: '', message: 'Please log in to submit a review.', type: 'error', isRead: false, createdAt: new Date().toISOString() });
      return;
    }
    if (rating === 0 || comment.trim() === '') {
      showToast({ _id: Date.now().toString(), recipient: user.id, message: 'Please provide a rating and a comment.', type: 'error', isRead: false, createdAt: new Date().toISOString() });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await API.post('/reviews', {
        product: productId,
        rating,
        comment,
      });
      showToast({ _id: Date.now().toString(), recipient: user.id, message: 'Review submitted successfully!', type: 'success', isRead: false, createdAt: new Date().toISOString() });
      onReviewSubmitted(data.data);
      setRating(0);
      setComment('');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      showToast({ _id: Date.now().toString(), recipient: user.id, message: error.response?.data?.message || 'Failed to submit review.', type: 'error', isRead: false, createdAt: new Date().toISOString() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 mb-10">
      <h3 className="text-2xl font-bold mb-6 text-dark">Write a Review</h3>
      {!user ? (
        <p className="text-gray-500">Please <a href="/login" className="text-primary hover:underline">log in</a> to write a review.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Your Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  className={`cursor-pointer transition-colors ${(hoveredRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                />
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-bold text-gray-700 mb-2">Your Comment</label>
            <textarea
              id="comment"
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              required
              disabled={isLoading}
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100"
            disabled={isLoading || rating === 0 || comment.trim() === ''}
          >
            {isLoading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </form>
      )}
    </div>
  );
};