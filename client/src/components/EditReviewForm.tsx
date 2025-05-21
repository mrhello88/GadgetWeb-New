import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../hooks/store/store';
import { updateReview } from '../hooks/store/thunk/review.thunk';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface EditReviewFormProps {
  reviewId: string;
  initialData: {
    rating: number;
    title: string;
    text: string;
  };
  onUpdate: () => void;
  onCancel: () => void;
}

const EditReviewForm = ({ reviewId, initialData, onUpdate, onCancel }: EditReviewFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.review);
  
  const [rating, setRating] = useState<number>(initialData.rating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState<string>(initialData.title);
  const [text, setText] = useState<string>(initialData.text);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    // Update form values if initialData changes
    setRating(initialData.rating);
    setTitle(initialData.title);
    setText(initialData.text);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !text.trim()) {
      setSubmitMessage('Please fill in all fields');
      toast.warning('Please fill in all fields');
      return;
    }
    
    try {
      console.log("Updating review:", { reviewId, rating, title, text });
      
      const result = await dispatch(updateReview({
        reviewId,
        rating,
        title: title.trim(),
        text: text.trim()
      })).unwrap();
      
      console.log("Review update result:", result);
      
      if (result.success) {
        setSubmitMessage('Review updated successfully!');
        toast.success('Review updated successfully!');
        setTimeout(() => {
          onUpdate();
        }, 1000);
      } else {
        setSubmitMessage(result.message || 'Failed to update review');
        toast.error(result.message || 'Failed to update review');
      }
    } catch (err) {
      console.error("Error updating review:", err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setSubmitMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Your Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Rating
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="focus:outline-none mr-1"
              >
                <Star 
                  className={`h-8 w-8 ${
                    (hoverRating !== null ? star <= hoverRating : star <= rating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </motion.button>
            ))}
            <span className="ml-2 text-gray-600 font-medium">
              {hoverRating !== null ? hoverRating : rating}/5
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="review-title" className="block text-gray-700 text-sm font-medium mb-2">
            Title
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-500"
            placeholder="Summarize your experience"
            maxLength={100}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="review-text" className="block text-gray-700 text-sm font-medium mb-2">
            Review
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-500"
            placeholder="Share your thoughts about this product"
            rows={5}
            maxLength={1000}
            required
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {text.length}/1000
          </div>
        </div>
        
        {submitMessage && (
          <div className={`mb-4 p-3 rounded-lg ${
            submitMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {submitMessage}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <motion.button
            type="button"
            className="px-6 py-2 bg-teal-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
          >
            Cancel
          </motion.button>
          
          <motion.button
            type="submit"
            className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating...
              </div>
            ) : (
              'Update Review'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditReviewForm; 