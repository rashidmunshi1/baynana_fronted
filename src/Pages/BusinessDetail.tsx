import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaStar, FaRegStar, FaShareAlt, FaCopy,
    FaInstagram, FaFacebookF, FaWhatsapp, FaPhoneAlt
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoCallOutline } from "react-icons/io5";
import { RiDirectionLine, RiSendPlaneFill } from "react-icons/ri";
import UserLayout from "../DesignLayout/UserLayout";
import ReviewModal from "../Components/ReviewModal";
import baseURL from "../config";

interface BusinessDetail {
    _id: string;
    businessName: string;
    ownerName: string;
    mobile: string;
    address: string;
    city: string;
    pincode: string;
    description?: string;
    category: { _id: string; name: string };
    subcategories: { _id: string; name: string }[];
    services: string[];
    images: string[];
    socialLinks?: string[];
    timings?: Record<string, { open?: string; close?: string; closed?: boolean }>;
    isPaid: boolean;
    rating?: number;
    ratingCount?: number;
    reviews?: {
        rating: number;
        review?: string;
        userName?: string;
        userId?: { _id: string; name: string; profileImage?: string };
        createdAt: string;
    }[];
    createdAt: string;
}

const BusinessDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<BusinessDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const fetchBusiness = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/user/business/${id}`);
            setBusiness(res.data);
        } catch (err) {
            console.error("Failed to fetch business:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchBusiness();
    }, [id]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: business?.businessName,
                url: window.location.href,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied!");
        }
    };

    if (loading) {
        return (
            <UserLayout>
                <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </UserLayout>
        );
    }

    if (!business) {
        return (
            <UserLayout>
                <div className="min-h-screen flex items-center justify-center">Business not found</div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="min-h-screen bg-white pb-20 font-sans">
                {/* Header Section */}
                <div className="bg-[#2a73e8] rounded-b-[40px] md:rounded-b-[80px] pt-6 pb-20 md:pb-28 px-4 relative text-white">
                    <div className="max-w-3xl mx-auto">
                        {/* Top Bar */}
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <div className="flex flex-1 items-center gap-3 md:gap-4 overflow-hidden">
                                <button onClick={() => navigate(-1)} className="text-white hover:bg-white/20 p-1.5 rounded-full transition flex-shrink-0">
                                    <IoIosArrowBack size={24} className="md:w-7 md:h-7" />
                                </button>
                                <h1 className="text-[17px] md:text-2xl font-bold truncate pr-4">{business.businessName}</h1>
                            </div>
                            <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                                <FiSearch size={22} className="cursor-pointer md:w-6 md:h-6" />
                                <FaShareAlt size={20} onClick={handleShare} className="cursor-pointer hover:text-blue-200 transition md:w-5 md:h-5" />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="px-1 md:px-5 space-y-1.5">
                            <p className="text-[13px] md:text-[15px] opacity-90 truncate">{business.address}, {business.city}</p>
                            <p className="text-[13px] md:text-[15px] font-medium">Opens at {business.timings?.monday?.open || "05:00 PM"}</p>
                            {business.isPaid && (
                                <div className="flex items-center gap-4 mt-2 md:mt-4 text-[11px] md:text-[13px] font-bold">
                                    <div className="flex items-center gap-1">
                                        <MdVerified size={15} /> verified
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-300">
                                        <div className="bg-yellow-300 text-blue-600 rounded-full p-[2px]">
                                            <FaStar size={10} />
                                        </div> trusted
                                    </div>
                                    <div className="flex items-center gap-1 text-white">
                                        <FaStar size={14} className="text-white" /> top rated
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 md:px-8">
                    {/* Overlapping Action Buttons */}
                    <div className="-mt-10 md:-mt-14 relative z-10 w-full mb-8">
                        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-4 md:py-6 md:px-8 flex justify-between items-center max-w-2xl mx-auto">
                            <a href={`tel:${business.mobile}`} className="flex flex-col items-center gap-1.5 md:gap-2 text-[#2a73e8] hover:scale-105 transition-transform">
                                <IoCallOutline size={26} className="md:w-7 md:h-7" />
                                <span className="text-[12px] md:text-[14px] font-semibold text-gray-700">Call</span>
                            </a>
                            <a href={`https://wa.me/91${business.mobile}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 md:gap-2 text-green-500 hover:scale-105 transition-transform">
                                <FaWhatsapp size={26} className="md:w-7 md:h-7" />
                                <span className="text-[12px] md:text-[14px] font-semibold text-gray-700">Whatsapp</span>
                            </a>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${business.address}+${business.city}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 md:gap-2 text-[#2a73e8] hover:scale-105 transition-transform">
                                <RiDirectionLine size={26} className="md:w-7 md:h-7" />
                                <span className="text-[12px] md:text-[14px] font-semibold text-gray-700">Direction</span>
                            </a>
                            <div onClick={() => setIsReviewOpen(true)} className="flex flex-col items-center gap-1.5 md:gap-2 text-[#2a73e8] cursor-pointer hover:scale-105 transition-transform">
                                <FaRegStar size={26} className="md:w-7 md:h-7" />
                                <span className="text-[12px] md:text-[14px] font-semibold text-gray-700">Review</span>
                            </div>
                        </div>
                    </div>

                    {/* Images Grid */}
                    <div className="grid grid-cols-2 gap-2 h-44 md:h-[400px] object-cover mb-8 md:mb-10">
                        <div className="bg-gray-200 rounded-l-xl h-full overflow-hidden">
                            {business.images && business.images[0] ? (
                                <img src={`${baseURL}/uploads/business/${business.images[0]}`} alt="b-1" className="w-full h-full object-cover" />
                            ) : null}
                        </div>
                        <div className="grid grid-rows-2 gap-2 h-full">
                            <div className="bg-gray-200 rounded-tr-xl overflow-hidden">
                                {business.images && business.images[1] ? (
                                    <img src={`${baseURL}/uploads/business/${business.images[1]}`} alt="b-2" className="w-full h-full object-cover" />
                                ) : null}
                            </div>
                            <div className="grid grid-cols-2 gap-2 h-full">
                                <div className="bg-gray-200 overflow-hidden">
                                    {business.images && business.images[2] ? (
                                        <img src={`${baseURL}/uploads/business/${business.images[2]}`} alt="b-3" className="w-full h-full object-cover" />
                                    ) : null}
                                </div>
                                <div className="bg-gray-200 rounded-br-xl overflow-hidden">
                                    {business.images && business.images[3] ? (
                                        <img src={`${baseURL}/uploads/business/${business.images[3]}`} alt="b-4" className="w-full h-full object-cover" />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rate this business */}
                    <div className="pt-2">
                        <h3 className="text-[14px] md:text-[18px] font-bold text-gray-800 mb-3 md:mb-4">Rate this business</h3>
                        <div className="flex gap-2.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <div onClick={() => setIsReviewOpen(true)} key={star} className="p-2 border border-gray-300 rounded text-gray-400 cursor-pointer hover:bg-gray-50 transition">
                                    <FaRegStar size={22} className="md:w-6 md:h-6 md:p-0.5" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className="border-gray-200 my-6 md:my-8" />

                    {/* Address Section */}
                    <div>
                        <h3 className="text-[14px] md:text-[18px] font-bold text-gray-800 mb-2 md:mb-3">Address</h3>
                        <p className="text-[13px] md:text-[15px] text-gray-600 mb-3 md:mb-4 leading-relaxed max-w-2xl">
                            {business.address}, {business.city}, {business.pincode}
                        </p>
                        <div className="flex gap-5 text-[#2a73e8] text-[13px] md:text-[14px] font-semibold">
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${business.address}+${business.city}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 cursor-pointer hover:underline">
                                <RiDirectionLine size={18} /> Directions
                            </a>
                            <button onClick={() => { navigator.clipboard.writeText(`${business.address}, ${business.city}`); alert("Copied!"); }} className="flex items-center gap-1.5 cursor-pointer hover:underline">
                                <FaCopy size={16} /> Copy
                            </button>
                        </div>
                    </div>

                    <hr className="border-gray-200 my-6 md:my-8" />

                    {/* Business Info */}
                    <div className="space-y-4 md:space-y-6">
                        <h3 className="text-[14px] md:text-[18px] font-bold text-gray-800">Business Info</h3>
                        <div>
                            <h4 className="text-[13px] md:text-[15px] font-bold text-gray-800 mb-1">Contacts</h4>
                            <p className="text-[13px] md:text-[15px] text-gray-600">+91 {business.mobile}</p>
                        </div>
                        <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1.5 -mx-1.5 rounded transition max-w-2xl">
                            <div>
                                <h4 className="text-[13px] md:text-[15px] font-bold text-gray-800 mb-1">Business Hours</h4>
                                <p className="text-[13px] md:text-[15px] text-gray-600">Open now : until {business.timings?.monday?.close || "11:00 pm"}</p>
                            </div>
                            <IoIosArrowForward className="text-gray-400" size={20} />
                        </div>
                        <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1.5 -mx-1.5 rounded transition max-w-2xl">
                            <h4 className="text-[13px] md:text-[15px] font-bold text-gray-800">Visit our website</h4>
                            <IoIosArrowForward className="text-gray-400" size={20} />
                        </div>
                        {business.socialLinks && business.socialLinks.filter(l => l && l.trim().length > 0).length > 0 && (
                            <div>
                                <h4 className="text-[13px] md:text-[15px] font-bold text-gray-800 mb-3 md:mb-4">Social Media</h4>
                                <div className="flex gap-5 text-gray-800 items-center">
                                    {business.socialLinks.filter(l => l && l.trim().length > 0).map((link, index) => {
                                        const url = link.startsWith('http') ? link : `https://${link}`;
                                        if (link.toLowerCase().includes("instagram")) {
                                            return (
                                                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition">
                                                    <FaInstagram size={22} className="md:w-6 md:h-6" />
                                                </a>
                                            );
                                        } else if (link.toLowerCase().includes("facebook")) {
                                            return (
                                                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
                                                    <FaFacebookF size={20} className="md:w-5 md:h-5" />
                                                </a>
                                            );
                                        } else {
                                            return (
                                                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 transition">
                                                    <FaShareAlt size={20} className="md:w-5 md:h-5" />
                                                </a>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-200 my-6 md:my-8" />

                    {/* Whatsapp Box */}
                    <div>
                        <div className="bg-[#fdf9f5] border border-orange-100 rounded-xl p-4 md:p-6 max-w-2xl shadow-sm">
                            <p className="text-[13px] md:text-[15px] text-gray-700 mb-3 md:mb-4">
                                Send your requirement on <span className="font-bold">WhatsApp</span>
                            </p>
                            <div className="flex items-center border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">
                                <div className="pl-3 md:pl-4">
                                    <FaWhatsapp className="text-green-500 md:w-5 md:h-5" size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="flex-1 px-3 py-2.5 md:py-3.5 text-[12px] md:text-[14px] text-gray-600 outline-none w-full bg-transparent"
                                    defaultValue="Hi, I found your business on baynana"
                                />
                                <a href={`https://wa.me/91${business.mobile}?text=Hi, I found your business on baynana`} target="_blank" rel="noopener noreferrer" className="bg-[#2a73e8] hover:bg-blue-600 transition flex items-center justify-center px-4 md:px-6 py-3 md:py-3.5 cursor-pointer">
                                    <RiSendPlaneFill className="text-white md:w-5 md:h-5" size={16} />
                                </a>
                            </div>
                            <div className="flex justify-between items-center mt-3 md:mt-4">
                                <span className="text-[11px] md:text-[13px] text-gray-500">Or call the business instantly</span>
                                <a href={`tel:${business.mobile}`} className="text-[11px] md:text-[13px] text-[#2a73e8] font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                                    <FaPhoneAlt size={10} className="md:w-3 md:h-3" /> Call Now
                                </a>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-200 my-8" />

                    {/* Ratings & Reviews Full Width Block */}
                    <div className="pb-12">
                        <h3 className="text-[15px] md:text-[18px] font-bold text-gray-800 mb-6">Ratings & Reviews</h3>
                        <div className="bg-[#00a650] text-white text-3xl md:text-5xl font-bold rounded-xl w-16 h-16 md:w-24 md:h-24 flex items-center justify-center mb-8 shadow-sm">
                            {business.rating ? business.rating.toFixed(1) : "0.0"}
                        </div>

                        <div className="space-y-6 md:space-y-8 max-w-2xl">
                            {(!business.reviews || business.reviews.length === 0) ? (
                                <div className="text-center py-6 md:py-10 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-gray-500 text-sm md:text-base">No reviews yet. Be the first to rate this business!</p>
                                </div>
                            ) : (
                                business.reviews.map((r, i) => (
                                    <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                                        <div className="flex items-center gap-3 mb-3 md:mb-4">
                                            <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-200 rounded-sm overflow-hidden flex items-center justify-center font-bold text-gray-500">
                                                {r.userId?.profileImage ? (
                                                    <img src={r.userId.profileImage.startsWith('http') ? r.userId.profileImage : `${baseURL}/${r.userId.profileImage}`} alt={r.userId?.name || "User"} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="default avatar" className="w-full h-full object-cover opacity-60" />
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-bold text-[14px] md:text-[16px] text-gray-800 block">{r.userId?.name || r.userName || `User ${i + 1}`}</span>
                                                <span className="text-[10px] md:text-[12px] text-gray-400 mt-0.5 block">{new Date(r.createdAt || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className="bg-[#00a650] text-white px-2 py-0.5 md:py-1 rounded flex items-center gap-1.5 text-[11px] md:text-[13px] font-bold w-fit mb-3 md:mb-4">
                                            {r.rating || "5"} <FaStar size={10} className="md:w-3 md:h-3" />
                                        </div>
                                        <p className="text-[13px] md:text-[15px] text-gray-600 leading-relaxed md:w-[90%]">
                                            {r.review || ""}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                businessId={business._id}
                businessName={business.businessName}
                onSuccess={() => {
                    fetchBusiness();
                }}
            />

        </UserLayout >
    );
};

export default BusinessDetailPage;
