import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp, FaStar, FaPen, FaShareAlt, FaDirections } from 'react-icons/fa';
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
    locationUrl?: string;
    latitude?: number;
    longitude?: number;
    isPaid?: boolean;
    rating?: number;
    ratingCount?: number;
}

interface Props {
    business: Business;
}

const BusinessListCard: React.FC<Props> = ({ business }) => {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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

    const hasDirection = business.locationUrl || (business.latitude && business.longitude);
    const directionUrl = business.latitude && business.longitude
        ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
        : business.locationUrl || '#';

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3">
                {/* Top section: Image + Info side by side */}
                <div className="flex gap-3 p-3">
                    {/* Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                        <img
                            src={mainImage}
                            alt={business.businessName}
                            className="w-full h-full object-cover"
                        />
                        {business.isPaid && (
                            <div className="absolute top-0 left-0 bg-yellow-400 text-[8px] font-bold px-1.5 py-0.5 rounded-br text-black tracking-wide">
                                PRO
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                        {/* Name */}
                        <h3 className="text-sm sm:text-base font-bold text-gray-800 leading-snug line-clamp-2">
                            {business.businessName}
                            {business.isPaid && <MdVerified className="inline-block text-blue-500 ml-1 text-xs" />}
                        </h3>

                        {/* Rating + Rate This */}
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                                <div className="bg-[#24a148] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    {stats.rating > 0 ? stats.rating : "New"} <FaStar size={7} />
                                </div>
                                <span className="text-[10px] text-gray-400">
                                    ({stats.ratingCount})
                                </span>
                            </div>
                            <button
                                onClick={() => setIsReviewModalOpen(true)}
                                className="text-[9px] font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors flex items-center gap-0.5"
                            >
                                <FaPen size={7} /> Rate
                            </button>
                        </div>

                        {/* Location & Category */}
                        <div className="mt-1">
                            <p className="text-[11px] text-gray-500 line-clamp-1 flex items-center gap-1">
                                <FaMapMarkerAlt size={9} className="text-gray-400 flex-shrink-0" />
                                {business.city || "Location"} • {business.category?.name || "Service"}
                            </p>
                            <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5 pl-3.5">
                                {business.address}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Bottom Bar */}
                <div className="flex items-stretch border-t border-gray-100">
                    <a href={`tel:${business.mobile}`} className="flex-1 border-r border-gray-100">
                        <button className="w-full py-2.5 text-blue-600 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-50 transition-colors">
                            <FaPhoneAlt size={10} /> Call
                        </button>
                    </a>
                    <a href={`https://wa.me/91${business.mobile}`} target="_blank" rel="noopener noreferrer" className="flex-1 border-r border-gray-100">
                        <button className="w-full py-2.5 text-[#25d366] text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-green-50 transition-colors">
                            <FaWhatsapp size={12} /> WhatsApp
                        </button>
                    </a>
                    {hasDirection ? (
                        <a href={directionUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <button className="w-full py-2.5 text-[#4285F4] text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-50 transition-colors">
                                <FaDirections size={12} /> Direction
                            </button>
                        </a>
                    ) : (
                        <a href={`https://wa.me/91${business.mobile}?text=Hi, I found your business on Baynana`} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <button className="w-full py-2.5 text-gray-500 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
                                <FaShareAlt size={10} /> Share
                            </button>
                        </a>
                    )}
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
