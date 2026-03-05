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
    <div className="space-y-10 divide-y divide-gray-50">
      {reviews.map((r) => {
        const hasLiked = currentUserId && (r.likes || []).some((id: any) => id === currentUserId || id._id === currentUserId);
        const hasDisliked = currentUserId && (r.dislikes || []).some((id: any) => id === currentUserId || id._id === currentUserId);

        return (
          <div key={r._id} id={`review-${r._id}`} className="flex gap-4 md:gap-8 pt-6 md:pt-10 first:pt-0">
            <div className="review-user-avatar bg-dark text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-lg">
              {r.user.name.charAt(0)}
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-dark text-sm md:text-xl">{r.user.name}</span>
                  {/* <span className="bg-green-100 text-green-700 text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm">Verified Premium Member</span> */}
                </div>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill={s <= r.rating ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>
              <div>
                <div className="review-comment collapsed text-gray-600 text-sm md:text-lg" id={`comment-${r._id}`}>
                  {r.comment}
                </div>
                {r.comment && r.comment.length > 80 && (
                  <span
                    className="review-toggle"
                    onClick={(e) => {
                      const comment = document.getElementById(`comment-${r._id}`);
                      const target = e.target as HTMLElement;
                      if (comment) {
                        if (comment.classList.contains("collapsed")) {
                          comment.classList.remove("collapsed");
                          target.innerText = "Show less";
                        } else {
                          comment.classList.add("collapsed");
                          target.innerText = "Read more";
                        }
                      }
                    }}
                  >
                    Read more
                  </span>
                )}
              </div>

              {/* Media Gallery */}
              {((r.images && r.images.length > 0) || r.video) && (
                <div className="mt-4 space-y-3">
                  {/* Images Grid */}
                  {r.images && r.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {r.images.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity">
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

              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Posted {new Date(r.createdAt).toLocaleDateString()}
              </p>

              {/* Actions: Like, Dislike, Comment, Share */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleLike(r._id)}
                  disabled={loadingAction === `like-${r._id}`}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${hasLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                >
                  <ThumbsUp size={16} className={hasLiked ? "fill-current" : ""} />
                  <span>{(r.likes || []).length > 0 ? (r.likes || []).length : 'Helpful'}</span>
                </button>

                <button
                  onClick={() => handleDislike(r._id)}
                  disabled={loadingAction === `dislike-${r._id}`}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${hasDisliked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                >
                  <ThumbsDown size={16} className={hasDisliked ? "fill-current" : ""} />
                  <span>{(r.dislikes || []).length > 0 ? (r.dislikes || []).length : ''}</span>
                </button>

                <button
                  onClick={() => setActiveCommentId(activeCommentId === r._id ? null : r._id)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${activeCommentId === r._id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <MessageSquare size={16} />
                  <span>{(r.comments || []).length > 0 ? (r.comments || []).length : 'Comment'}</span>
                </button>

                <button
                  onClick={() => handleShare(r)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors ml-auto"
                >
                  <Share2 size={16} />
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

              {/* Comment Input Box */}
              {activeCommentId === r._id && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommentSubmit(r._id);
                    }}
                  />
                  <button
                    onClick={() => handleCommentSubmit(r._id)}
                    disabled={!commentText.trim() || loadingAction === `comment-${r._id}`}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    Post
                  </button>
                </div>
              )}

            </div>
          </div>
        )
      })}
    </div>
  );
};