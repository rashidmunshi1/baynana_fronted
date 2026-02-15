import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp, FaStar, FaPen, FaShareAlt } from 'react-icons/fa';
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
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex gap-3 mb-3 relative overflow-hidden">
                {/* LEFT: Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden relative">
                    <img
                        src={mainImage}
                        alt={business.businessName}
                        className="w-full h-full object-cover"
                    />
                    {business.isPaid && (
                        <div className="absolute top-0 left-0 bg-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded-br text-black">
                            PRO
                        </div>
                    )}
                </div>

                {/* RIGHT: Content */}
                <div className="flex-1 flex flex-col justify-between">
                    {/* Top Row: Name & Rating */}
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-base font-bold text-gray-800 leading-tight line-clamp-2">
                                {business.businessName}
                                {business.isPaid && <MdVerified className="inline-block text-blue-500 ml-1 text-sm" />}
                            </h3>
                            {/* Favorite Icon (Placeholder) */}
                            {/* <FaHeart className="text-gray-300" /> */}
                        </div>

                        {/* Ratings & Rate This */}
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                                <div className="bg-[#24a148] text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    {stats.rating > 0 ? stats.rating : "New"} <FaStar size={8} />
                                </div>
                                <span className="text-[10px] text-gray-500">
                                    ({stats.ratingCount})
                                </span>
                            </div>

                            <button
                                onClick={() => setIsReviewModalOpen(true)}
                                className="text-[10px] font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded-sm hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                                <FaPen size={8} /> Rate This
                            </button>
                        </div>

                        {/* Location & Category */}
                        <div className="mt-1.5">
                            <p className="text-[11px] text-gray-500 line-clamp-1">
                                {business.city ? business.city : "Location"} • {business.category?.name || "Service"}
                            </p>
                            <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                                {business.address}
                            </p>
                        </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex items-center gap-2 mt-3">
                        <a href={`tel:${business.mobile}`} className="flex-1">
                            <button className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                                <FaPhoneAlt size={10} /> Call Now
                            </button>
                        </a>
                        <a href={`https://wa.me/91${business.mobile}`} className="flex-1">
                            <button className="w-full bg-[#25d366] hover:bg-[#20bd5a] text-white py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                                <FaWhatsapp size={12} /> WhatsApp
                            </button>
                        </a>
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
