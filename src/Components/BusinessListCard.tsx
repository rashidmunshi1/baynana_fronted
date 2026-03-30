import React, { useState } from 'react';
import { FaPhoneAlt, FaWhatsapp, FaStar, FaRegThumbsUp } from 'react-icons/fa';
import { MdVerified, MdOutlineLocationOn } from 'react-icons/md';
import { useNavigate } from "react-router-dom";
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
    timings?: any;
}

interface Props {
    business: Business;
}

const BusinessListCard: React.FC<Props> = ({ business }) => {
    const navigate = useNavigate();
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
            <div
                className="bg-white pb-5 border-b-[6px] border-gray-100 cursor-pointer"
                onClick={() => navigate(`/business/${business._id}`)}
            >
                {/* Images Row */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pt-4 pb-3">
                    {business.images && business.images.length > 0 ? (
                        business.images.slice(0, 3).map((img: string, idx: number) => (
                            <div key={idx} className="w-[110px] sm:w-[130px] h-[140px] flex-shrink-0 bg-[#e5e5e5] rounded-xl overflow-hidden shadow-sm">
                                <img src={`${baseURL}/uploads/business/${img}`} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="w-[110px] sm:w-[130px] h-[140px] flex-shrink-0 bg-[#e5e5e5] rounded-xl"></div>
                            <div className="w-[110px] sm:w-[130px] h-[140px] flex-shrink-0 bg-[#e5e5e5] rounded-xl"></div>
                            <div className="w-[110px] sm:w-[130px] h-[140px] flex-shrink-0 bg-[#e5e5e5] rounded-xl"></div>
                        </>
                    )}
                </div>

                <div className="px-4 mt-1">
                    {/* Badges Area */}
                    <div className="flex items-center gap-3 mb-2.5">
                        {business.isPaid && (
                            <div className="flex items-center gap-1 text-[#006aff]">
                                <MdVerified size={16} />
                                <span className="text-[13px] font-bold tracking-tight lowercase">verified</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-[#ffc107]">
                            <div className="bg-[#ffc107] text-white rounded-full p-[2px] flex items-center justify-center">
                                <FaStar size={10} />
                            </div>
                            <span className="text-[13px] font-bold tracking-tight lowercase">trusted</span>
                        </div>
                        <div className="flex items-center gap-1 text-black">
                            <FaRegThumbsUp size={14} className="mt-[-2px]" />
                            <span className="text-[13px] font-bold tracking-tight lowercase">top rated</span>
                        </div>
                    </div>

                    {/* Title & Subtitle */}
                    <h2 className="text-[22px] font-bold text-black leading-tight mb-1">
                        {business.businessName}
                    </h2>
                    <p className="text-gray-600 text-[15px] mb-2 font-medium">
                        {business.address ? `${business.address}, ${business.city}` : business.city}
                    </p>

                    {/* Time */}
                    {(() => {
                        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                        const currentDay = days[new Date().getDay()];
                        const todayTiming = business.timings?.[currentDay];
                        const isClosed = todayTiming?.closed;
                        
                        const formatTime = (time?: string) => {
                            if (!time) return "";
                            const [h, m] = time.split(":");
                            if (!h || !m) return time;
                            const hour = parseInt(h, 10);
                            const ampm = hour >= 12 ? "PM" : "AM";
                            const formattedHour = hour % 12 || 12;
                            return `${formattedHour.toString().padStart(2, "0")}:${m} ${ampm}`;
                        };
                        
                        const openTime = formatTime(todayTiming?.open);
                        const closeTime = formatTime(todayTiming?.close);

                        return (
                            <p className={`font-bold text-[14px] mb-4 ${isClosed ? 'text-red-500' : 'text-[#00a650]'}`}>
                                {isClosed 
                                    ? "Closed Today" 
                                    : (openTime && closeTime ? `Open Today: ${openTime} - ${closeTime}` : "Open Today")}
                            </p>
                        );
                    })()}

                    {/* Buttons */}
                    <div
                        className="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <a href={`tel:${business.mobile}`} className="flex-[1.2] min-w-[120px]">
                            <button className="w-full bg-[#3F87DF] text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-[15px] hover:bg-[#326CB2] transition shadow-sm">
                                <FaPhoneAlt size={14} /> Call Now
                            </button>
                        </a>
                        <a href={`https://wa.me/91${business.mobile}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[110px]">
                            <button className="w-full bg-white border-[1.5px] border-[#333] text-black py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-[15px] hover:bg-gray-50 transition shadow-sm">
                                <FaWhatsapp className="text-[#25d366]" size={18} /> WhatsApp
                            </button>
                        </a>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${business.latitude || ''},${business.longitude || ''}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[110px]">
                            <button className="w-full bg-white border-[1.5px] border-[#333] text-black py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-[15px] hover:bg-gray-50 transition shadow-sm">
                                <MdOutlineLocationOn size={18} /> Directions
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
