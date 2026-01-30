import React from 'react';
import { Star } from 'lucide-react';
import { Review } from '@/app/types'; // Adjust path as necessary

interface ReviewListProps {
  reviews: Review[];
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-2xl">
        <p className="text-gray-500 text-lg">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 divide-y divide-gray-50">
      {reviews.map((r) => (
        <div key={r._id} className="flex gap-8 pt-10 first:pt-0">
          <div className="w-16 h-16 bg-dark text-white rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 shadow-lg">
            {r.user.name.charAt(0)}
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-dark text-xl">{r.user.name}</span>
                {/* <span className="bg-green-100 text-green-700 text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm">Verified Premium Member</span> */}
              </div>
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill={s <= r.rating ? "currentColor" : "none"} />
                ))}
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">{r.comment}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Posted {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};