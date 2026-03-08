import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { message } from 'antd';
import baseURL from '../config';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
    businessName: string;
    existingReviewId?: string | null;
    existingRating?: number;
    existingComment?: string;
    onSuccess?: (rating: number) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, businessId, businessName, existingReviewId, existingRating, existingComment, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setRating(existingRating || 0);
            setComment(existingComment || '');
            setHover(0);
        } else {
            setRating(0);
            setComment('');
            setHover(0);
        }
    }, [isOpen, existingRating, existingComment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            message.warning("Please select a rating");
            return;
        }

        const userId = localStorage.getItem("userId");
        if (!userId) {
            message.error("Please login to submit or update a review");
            return;
        }

        try {
            setLoading(true);

            if (existingReviewId) {
                // Update existing review
                await axios.put(`${baseURL}/api/user/update-review/${existingReviewId}`, {
                    rating,
                    review: comment
                });
                message.success('Review updated successfully!');
            } else {
                // Post new review
                await axios.post(`${baseURL}/api/user/add-review`, {
                    businessId,
                    userId,
                    rating,
                    review: comment
                });
                message.success('Review submitted successfully!');
            }

            if (onSuccess) {
                onSuccess(rating);
            }
            onClose();
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Failed to submit review. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style={{ margin: 0 }}>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">{existingReviewId ? "Edit your Review" : "Write a Review"}</h3>
                            <button type="button" onClick={onClose} className="text-white/80 hover:text-white transition">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 text-sm mb-4">
                                Share your experience with <span className="font-bold text-gray-800">{businessName}</span>
                            </p>

                            <form onSubmit={handleSubmit}>
                                {/* Star Rating */}
                                <div className="flex justify-center gap-2 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                        >
                                            <FaStar
                                                size={32}
                                                className="transition-colors"
                                                color={star <= (hover || rating) ? "#fbbf24" : "#e5e7eb"} // amber-400 vs gray-200
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="text-center text-sm font-medium text-gray-500 mb-4 h-5">
                                    {rating > 0 && (
                                        rating === 1 ? "Terrible" :
                                            rating === 2 ? "Bad" :
                                                rating === 3 ? "Okay" :
                                                    rating === 4 ? "Good" : "Excellent"
                                    )}
                                </div>

                                {/* Comment */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                                    <textarea
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Tell us about your experience..."
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none text-sm"
                                        required
                                    ></textarea>
                                </div>

                                {/* Actions */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 rounded-lg text-white font-semibold transition-all shadow-md ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700 hover:shadow-lg active:scale-[0.98]"
                                        }`}
                                >
                                    {loading ? (existingReviewId ? "Updating..." : "Submitting...") : (existingReviewId ? "Update Review" : "Submit Review")}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReviewModal;
