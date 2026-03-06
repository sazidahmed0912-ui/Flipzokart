import React, { useState } from 'react';
import { Star, PlayCircle, X, ThumbsUp, ThumbsDown, MessageSquare, Share2 } from 'lucide-react';
import LazyImage from '@/app/components/LazyImage'; // Reusing for optimization
import { Review } from '@/app/types'; // Adjust path as necessary
import { useToast } from '@/app/components/toast';

interface ReviewListProps {
  reviews: Review[];
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews: initialReviews }) => {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  // Extract user ID from token (mock/simple parsing, ideally use context/store)
  let currentUserId: string | null = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.id || payload._id;
    } catch (e) {
      console.warn("Failed to parse token for user ID");
    }
  }

  // Handle new props
  React.useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const handleLike = async (reviewId: string) => {
    if (!token) {
      addToast('error', 'Please login to like reviews');
      return;
    }
    setLoadingAction(`like-${reviewId}`);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(prev => prev.map(r => r._id === reviewId ? data.data : r));
      } else {
        addToast('error', data.message || 'Failed to like');
      }
    } catch (error) {
      addToast('error', 'Network error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDislike = async (reviewId: string) => {
    if (!token) {
      addToast('error', 'Please login to dislike reviews');
      return;
    }
    setLoadingAction(`dislike-${reviewId}`);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}/dislike`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(prev => prev.map(r => r._id === reviewId ? data.data : r));
      } else {
        addToast('error', data.message || 'Failed to dislike');
      }
    } catch (error) {
      addToast('error', 'Network error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCommentSubmit = async (reviewId: string) => {
    if (!token) {
      addToast('error', 'Please login to comment');
      return;
    }
    if (!commentText.trim()) return;

    setLoadingAction(`comment-${reviewId}`);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: commentText })
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(prev => prev.map(r => r._id === reviewId ? data.data : r));
        setCommentText("");
        setActiveCommentId(null);
        addToast('success', 'Comment added');
      } else {
        addToast('error', data.message || 'Failed to comment');
      }
    } catch (error) {
      addToast('error', 'Network error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleShare = async (review: Review) => {
    const url = `${window.location.origin}/product/${review.product._id || review.product}#review-${review._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this review',
          text: `Review by ${review.user.name}: "${review.comment.substring(0, 50)}..."`,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        addToast('success', 'Link copied to clipboard!');
      } catch (err) {
        addToast('error', 'Failed to copy link');
      }
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-2xl">
        <p className="text-gray-500 text-lg">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => {
        const hasLiked = currentUserId && (r.likes || []).some((id: any) => id === currentUserId || id._id === currentUserId);
        const hasDisliked = currentUserId && (r.dislikes || []).some((id: any) => id === currentUserId || id._id === currentUserId);

        const reviewerName = r.user?.name || (r as any).userName || 'Anonymous';

        return (
          <div key={r._id} id={`review-${r._id}`} className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] mb-4 flex gap-2.5 md:gap-4 relative">
            <div className="w-[40px] h-[40px] rounded-full bg-dark text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {reviewerName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-dark text-sm md:text-base">{reviewerName}</span>
                </div>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 md:w-4 md:h-4" fill={s <= r.rating ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>
              <div>
                <div
                  className="review-comment collapsed text-gray-700 text-[14px] leading-[1.6] cursor-pointer cursor-expand"
                  id={`comment-${r._id}`}
                  onClick={(e) => {
                    const comment = e.currentTarget;
                    if (comment.classList.contains("collapsed")) {
                      comment.classList.remove("collapsed");
                      comment.style.display = "block";
                      comment.style.webkitLineClamp = "unset";
                    } else {
                      comment.classList.add("collapsed");
                      comment.style.display = "-webkit-box";
                      comment.style.webkitLineClamp = "2";
                    }
                  }}
                >
                  {r.comment}
                </div>
              </div>

              {/* Media Gallery */}
              {((r.images && r.images.length > 0) || r.video) && (
                <div className="mt-4 space-y-3">
                  {/* Images Grid */}
                  {r.images && r.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {r.images.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity">
                          <img
                            src={img}
                            alt={`Review image ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onClick={() => window.open(img, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Video Player */}
                  {r.video && (
                    <div className="w-full max-w-xs rounded-lg overflow-hidden bg-black aspect-video relative group">
                      <video
                        src={r.video}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 md:mt-0">
                Posted {new Date(r.createdAt).toLocaleDateString()}
              </p>

              {/* Actions: Like, Dislike, Comment, Share */}
              <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleLike(r._id)}
                  disabled={loadingAction === `like-${r._id}`}
                  className={`flex items-center gap-1.5 text-xs md:text-sm font-medium transition-colors ${hasLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
                  <span>{(r.likes || []).length > 0 ? (r.likes || []).length : 'Helpful'}</span>
                </button>

                <button
                  onClick={() => handleDislike(r._id)}
                  disabled={loadingAction === `dislike-${r._id}`}
                  className={`flex items-center gap-1.5 text-xs md:text-sm font-medium transition-colors ${hasDisliked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                >
                  <ThumbsDown className={`w-4 h-4 ${hasDisliked ? "fill-current" : ""}`} />
                  <span>{(r.dislikes || []).length > 0 ? (r.dislikes || []).length : ''}</span>
                </button>

                <button
                  onClick={() => handleShare(r)}
                  className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-gray-500 hover:text-green-600 transition-colors ml-auto"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              {/* Comments Section */}
              {(r.comments && r.comments.length > 0) && (
                <div className="mt-4 pl-4 md:pl-6 border-l-2 border-gray-100 space-y-4">
                  {r.comments.map(c => (
                    <div key={c._id} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{c.user?.name || 'User'}</span>
                        <span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{c.comment}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )
      })}
    </div>
  );
};