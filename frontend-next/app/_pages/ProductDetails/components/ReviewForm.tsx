import React, { useState, useRef } from 'react';
import { Star, Loader, Upload, X, Image as ImageIcon, Video, PlayCircle } from 'lucide-react';
import { useApp } from '@/app/store/Context'; // Adjust path as necessary
import { useToast } from '@/app/components/toast';
import API from '@/app/services/api'; // Corrected: Import API as default
import { Review } from '@/app/types'; // Adjust path as necessary

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: (review: Review) => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
  const { user } = useApp();
  const { addToast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024); // 2MB limit

      if (files.length !== validFiles.length) {
        addToast('warning', 'Some images were skipped (max 2MB per image)');
      }

      setImages(prev => {
        const combined = [...prev, ...validFiles];
        return combined.slice(0, 5); // Max 5 images
      });
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        addToast('warning', 'Video must be less than 10MB');
        return;
      }
      setVideo(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('error', 'Please log in to submit a review.');
      return;
    }
    if (rating === 0 || comment.trim() === '') {
      addToast('warning', 'Please provide a rating and a comment.');
      return;
    }

    setIsLoading(true);
    setIsUploading(true);
    try {
      let imageUrls: string[] = [];
      let videoUrl: string = '';

      // Upload Images
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(img => formData.append('image', img));

        try {
          const uploadRes = await API.post('/api/upload/multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data.success) {
            imageUrls = uploadRes.data.urls;
          }
        } catch (err) {
          console.error("Image upload failed", err);
          addToast('error', 'Failed to upload images');
          setIsLoading(false);
          setIsUploading(false);
          return;
        }
      }

      // Upload Video
      if (video) {
        const formData = new FormData();
        formData.append('image', video); // Reuse 'image' field for upload middleware
        try {
          const uploadRes = await API.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          videoUrl = uploadRes.data; // Single upload returns string URL
        } catch (err) {
          console.error("Video upload failed", err);
          addToast('error', 'Failed to upload video');
          setIsLoading(false);
          setIsUploading(false);
          return;
        }
      }

      const { data } = await API.post('/api/reviews', {
        product: productId,
        rating,
        comment,
        images: imageUrls,
        video: videoUrl || null
      });
      addToast('success', '✅ Review submitted successfully!');
      onReviewSubmitted(data.data);
      setRating(0);
      setComment('');
      setImages([]);
      setVideo(null);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      addToast('error', error.response?.data?.message || 'Failed to submit review.');
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

          {/* Media Upload Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-700">Add Photos & Video</h4>

            <div className="flex flex-wrap gap-4">
              {/* Image Upload Button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={images.length >= 5 || isLoading}
                className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon size={24} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 font-medium">Add Photo</span>
                <span className="text-[9px] text-gray-400">{images.length}/5</span>
              </button>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/webp"
                multiple
                hidden
              />

              {/* Video Upload Button */}
              {!video && (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 font-medium">Add Video</span>
                </button>
              )}
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                accept="video/mp4, video/webm"
                hidden
              />
            </div>

            {/* Previews */}
            {(images.length > 0 || video) && (
              <div className="flex flex-wrap gap-3 mt-4">
                {/* Images */}
                {images.map((file, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Video */}
                {video && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-black">
                    <video src={URL.createObjectURL(video)} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <PlayCircle size={20} className="text-white bg-black/50 rounded-full" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setVideo(null)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors z-10"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Max 5 images (2MB each) and 1 video (10MB).
            </p>
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