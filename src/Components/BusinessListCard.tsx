import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp, FaStar, FaPen } from 'react-icons/fa'; // Changed icons to match style
import { MdVerified } from 'react-icons/md';
import baseURL from "../config";
import ReviewModal from './ReviewModal';

interface Business {
    _id?: string;
    businessName?: string;
    address?: string;
    city?: string;
    mobile?: string;
    images?: string[];
    description?: string;
    category?: any;
    locationUrl?: string; // Map link
    isPaid?: boolean;
    rating?: number; // Assuming we might have this
    ratingCount?: number;
}

interface Props {
    business: Business;
}

const BusinessListCard: React.FC<Props> = ({ business }) => {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // Local state to update UI immediately without refresh
    const [stats, setStats] = useState({
        rating: business.rating || 0,
        ratingCount: business.ratingCount || 0
    });

    const mainImage = business.images && business.images.length > 0
        ? `${baseURL}/uploads/business/${business.images[0]}`
        : "https://via.placeholder.com/300";

    const handleReviewSuccess = (newRating: number) => {
        // Calculate new average purely on client side for instant feedback
        // Logic: ((oldAvg * oldCnt) + newRating) / (oldCnt + 1)
        const currentCount = stats.ratingCount;
        const currentRating = stats.rating;

        const newCount = currentCount + 1;
        const newAvg = ((currentRating * currentCount) + newRating) / newCount;

        setStats({
            rating: parseFloat(newAvg.toFixed(1)),
            ratingCount: newCount
        });
    };

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-4 flex flex-col md:flex-row">

                {/* LEFT: Image */}
                <div className="w-full md:w-[280px] h-48 md:h-auto relative flex-shrink-0 bg-gray-100">
                    <img
                        src={mainImage}
                        alt={business.businessName}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* RIGHT: Content */}
                <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
                    <div>
                        {/* Header: Name & Badges */}
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
                                        {business.businessName}
                                    </h2>
                                    {/* Verified Badge */}
                                    {business.isPaid && (
                                        <div className="flex items-center gap-1 text-[10px] bg-blue-50 px-2 py-0.5 rounded text-blue-600 font-semibold border border-blue-100 whitespace-nowrap">
                                            <MdVerified />
                                            <span>Verified</span>
                                        </div>
                                    )}
                                </div>

                                {/* Rating Row (Updated from State) */}
                                {(stats.rating > 0 || stats.ratingCount > 0) && (
                                    <div className="flex items-center gap-2 mb-2 flex-wrap text-xs md:text-sm">
                                        {stats.rating > 0 && (
                                            <div className="bg-green-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                                {stats.rating} <FaStar size={10} />
                                            </div>
                                        )}
                                        {stats.ratingCount > 0 && (
                                            <span className="text-gray-500">{stats.ratingCount} Ratings</span>
                                        )}
                                    </div>
                                )}

                                {/* Location */}
                                <div className="flex items-start gap-1.5 text-gray-600 text-xs md:text-sm mb-3">
                                    <FaMapMarkerAlt className="mt-0.5 text-gray-400 flex-shrink-0" />
                                    <p className="line-clamp-1">{business.address}, {business.city}</p>
                                </div>

                                {/* Description (fallback for tags) */}
                                {business.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                        {business.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">

                        {/* Call Button */}
                        <a href={`tel:${business.mobile}`} className="flex-1">
                            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-2 md:px-4 py-2 rounded-md font-semibold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap">
                                <FaPhoneAlt size={12} />
                                Call Now
                            </button>
                        </a>

                        {/* WhatsApp Button */}
                        <a href={`https://wa.me/91${business.mobile}`} className="flex-1">
                            <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2 md:px-4 py-2 rounded-md font-semibold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap">
                                <FaWhatsapp size={14} className="text-green-500" />
                                WhatsApp
                            </button>
                        </a>

                        {/* Review Button - Added */}
                        <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="flex-1 bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 px-2 md:px-4 py-2 rounded-md font-semibold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                        >
                            <FaPen size={12} />
                            Review
                        </button>

                        {/* Best Deal Button */}
                        <button className="w-full md:w-auto flex-none bg-[#0077EE] hover:bg-[#0066CC] text-white px-4 py-2 rounded-md font-semibold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                                <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                                <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
                            </svg>
                            Get Best Deal
                        </button>
                    </div>
                </div>
            </div>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                businessId={business._id || ""}
                businessName={business.businessName || "Business"}
                onSuccess={handleReviewSuccess}
            />
        </>
    );
};

export default BusinessListCard;
