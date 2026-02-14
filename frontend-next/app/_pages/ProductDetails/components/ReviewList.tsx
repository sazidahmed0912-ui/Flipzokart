import React, { useState } from 'react';
import { Star, PlayCircle, X } from 'lucide-react';
import LazyImage from '@/app/components/LazyImage'; // Reusing for optimization
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
        <div key={r._id} className="flex gap-4 md:gap-8 pt-6 md:pt-10 first:pt-0">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-dark text-white rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-sm md:text-xl shrink-0 shadow-lg">
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
            <p className="text-gray-600 text-sm md:text-lg leading-relaxed">{r.comment}</p>

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
          </div>
        </div>
      ))}
    </div>
  );
};