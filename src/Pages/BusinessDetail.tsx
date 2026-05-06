import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaStar, FaRegStar, FaShareAlt, FaCopy,
    FaInstagram, FaFacebookF, FaWhatsapp, FaPhoneAlt, FaEdit, FaTrash,
    FaTwitter, FaLinkedinIn, FaYoutube, FaLink
} from "react-icons/fa";

import { MdVerified } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoCallOutline, IoLocationOutline } from "react-icons/io5";
import { RiDirectionLine, RiSendPlaneFill } from "react-icons/ri";
import { FiSend } from "react-icons/fi";
import UserLayout from "../DesignLayout/UserLayout";
import ReviewModal from "../Components/ReviewModal";
import baseURL from "../config";
import LoadingSpinner from "../Components/LoadingSpinner";

interface BusinessDetail {
    _id: string;
    businessName: string;
    ownerName: string;
    userId: string;
    mobile: string;
    address: string;
    city: string;
    pincode: string;
    description?: string;
    website?: string;
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
        _id?: string;
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
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [editReviewData, setEditReviewData] = useState<{ id: string | null; rating: number; review: string }>({ id: null, rating: 0, review: '' });
    const [isHoursOpen, setIsHoursOpen] = useState(false);

    const currentUserId = localStorage.getItem("userId");

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

    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm("Are you sure you want to delete your review?")) return;
        try {
            await axios.delete(`${baseURL}/api/user/delete-review/${reviewId}`);
            alert("Review deleted successfully!");
            fetchBusiness();
        } catch (err) {
            console.error("Failed to delete review", err);
            alert("Could not delete review.");
        }
    };

    const handleOpenReviewModal = () => {
        if (!currentUserId) {
            alert("Please login to give a review.");
            return;
        }

        if (business?.userId === currentUserId) {
            alert("Owners cannot review their own business.");
            return;
        }

        const existing = business?.reviews?.find(r => r.userId?._id === currentUserId);
        if (existing) {
            setEditReviewData({ id: existing._id || null, rating: existing.rating, review: existing.review || '' });
        } else {
            setEditReviewData({ id: null, rating: 0, review: '' });
        }
        setIsReviewOpen(true);
    };

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
                    <LoadingSpinner text="Loading business details..." />
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
                <div className="bg-[#2a73e8] pt-6 pb-16 px-4 relative text-white" style={{ borderBottomLeftRadius: '50% 15%', borderBottomRightRadius: '50% 15%' }}>
                    <div className="max-w-3xl mx-auto">
                        {/* Top Bar */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate(-1)} className="text-white hover:bg-white/20 p-1 rounded-full transition flex-shrink-0">
                                    <IoIosArrowBack size={24} />
                                </button>
                                <h1 className="text-[20px] font-bold truncate pr-2">{business.businessName}</h1>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <FiSend size={18} onClick={handleShare} className="cursor-pointer" />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="px-10 space-y-1">
                            <p className="text-[15px] opacity-90 truncate">{business.address}, {business.city}</p>
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

                                return (
                                    <p className="text-[13px] font-medium text-white">
                                        {isClosed ? "Closed Today" : (openTime ? `Opens at ${openTime}` : "Open Today")}
                                    </p>
                                );
                            })()}
                            
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] font-bold">
                                <div className="flex items-center gap-1">
                                    <MdVerified size={14} /> verified
                                </div>
                                <div className="flex items-center gap-1 text-yellow-300">
                                    <div className="bg-yellow-300 text-[#2a73e8] rounded-full p-[1px]">
                                        <FaStar size={8} />
                                    </div> trusted
                                </div>
                                <div className="flex items-center gap-1 text-white">
                                    <FaStar size={12} className="text-white" /> top rated
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 md:px-8">
                    {/* Overlapping Action Buttons */}
                    <div className="-mt-8 relative z-10 w-full mb-6 flex justify-center gap-3">
                        <a href={`tel:${business.mobile}`} className="flex flex-col items-center gap-1 w-16">
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-[#2a73e8] flex justify-center items-center w-full">
                                <IoCallOutline size={22} />
                            </div>
                            <span className="text-[11px] font-medium text-gray-700">Call</span>
                        </a>
                        <a href={`https://wa.me/91${business.mobile}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 w-16">
                            <div className="bg-[#25d366] rounded-lg p-3 shadow-sm text-white flex justify-center items-center w-full">
                                <FaWhatsapp size={22} />
                            </div>
                            <span className="text-[11px] font-medium text-gray-700">Whatsapp</span>
                        </a>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${business.address}+${business.city}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 w-16">
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-[#2a73e8] flex justify-center items-center w-full">
                                <IoLocationOutline size={22} />
                            </div>
                            <span className="text-[11px] font-medium text-gray-700">Direction</span>
                        </a>
                        <div onClick={handleOpenReviewModal} className="flex flex-col items-center gap-1 w-16 cursor-pointer">
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-[#2a73e8] flex justify-center items-center w-full">
                                <FaRegStar size={22} />
                            </div>
                            <span className="text-[11px] font-medium text-gray-700">Review</span>
                        </div>
                    </div>

                    {/* Images Grid */}
                    {business.images && business.images.length > 0 && (
                        <div className={`grid gap-2 h-48 md:h-64 mb-6 min-h-0 ${business.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {business.images.length === 1 && (
                                <div className="bg-gray-200 rounded-xl h-full min-h-0 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(`${baseURL}/uploads/business/${business.images[0]}`)}>
                                    <img src={`${baseURL}/uploads/business/${business.images[0]}`} alt="b-1" className="w-full h-full object-cover" />
                                </div>
                            )}

                            {business.images.length === 2 && (
                                <>
                                    <div className="bg-gray-200 rounded-l-xl h-full min-h-0 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(`${baseURL}/uploads/business/${business.images[0]}`)}>
                                        <img src={`${baseURL}/uploads/business/${business.images[0]}`} alt="b-1" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="bg-gray-200 rounded-r-xl h-full min-h-0 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(`${baseURL}/uploads/business/${business.images[1]}`)}>
                                        <img src={`${baseURL}/uploads/business/${business.images[1]}`} alt="b-2" className="w-full h-full object-cover" />
                                    </div>
                                </>
                            )}

                            {business.images.length === 3 && (
                                <>
                                    <div className="bg-gray-200 rounded-l-xl h-full min-h-0 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(`${baseURL}/uploads/business/${business.images[0]}`)}>
                                        <img src={`${baseURL}/uploads/business/${business.images[0]}`} alt="b-1" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="grid grid-rows-2 gap-2 h-full min-h-0">
                                        <div className="bg-gray-200 rounded-tr-xl h-full min-h-0 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(`${baseURL}/uploads/business/${business.images[1]}`)}>
                                            <img src={`${baseURL}/uploads/business/${business.images[1]}`} alt="b-2" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="bg-gray-200 rounded-br-xl h-full min-h-0 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(`${baseURL}/uploads/business/${business.images[2]}`)}>
                                            <img src={`${baseURL}/uploads/business/${business.images[2]}`} alt="b-3" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {business.images.length >= 4 && (
                                <>
                                    <div className="bg-gray-200 rounded-l-xl h-full min-h-0 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(`${baseURL}/uploads/business/${business.images[0]}`)}>
                                        <img src={`${baseURL}/uploads/business/${business.images[0]}`} alt="b-1" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="grid grid-rows-2 gap-2 h-full min-h-0">
                                        <div className="bg-gray-200 rounded-tr-xl h-full min-h-0 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(`${baseURL}/uploads/business/${business.images[1]}`)}>
                                            <img src={`${baseURL}/uploads/business/${business.images[1]}`} alt="b-2" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 h-full min-h-0">
                                            <div className="bg-gray-200 h-full min-h-0 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(`${baseURL}/uploads/business/${business.images[2]}`)}>
                                                <img src={`${baseURL}/uploads/business/${business.images[2]}`} alt="b-3" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="bg-gray-200 rounded-br-xl h-full min-h-0 overflow-hidden relative cursor-pointer" onClick={() => setPreviewImage(`${baseURL}/uploads/business/${business.images[3]}`)}>
                                                <img src={`${baseURL}/uploads/business/${business.images[3]}`} alt="b-4" className="w-full h-full object-cover" />
                                                {business.images.length > 4 && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg md:text-2xl">
                                                        +{business.images.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Rate this business */}
                    <div className="mb-2">
                        <h3 className="text-[14px] font-bold text-gray-800 mb-2">Rate this business</h3>
                        {business.userId === currentUserId ? (
                            <p className="text-xs text-gray-500 italic">Owner cannot rate.</p>
                        ) : (
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <div onClick={handleOpenReviewModal} key={star} className="p-1.5 border border-gray-400 rounded text-gray-500 cursor-pointer">
                                        <FaRegStar size={18} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-300 my-3" />

                    {/* Address Section */}
                    <div className="mb-2">
                        <h3 className="text-[16px] font-bold text-gray-800 mb-1.5">Address</h3>
                        <p className="text-[15px] text-gray-600 mb-2 leading-relaxed">
                            {business.address}, {business.city}, {business.pincode}
                        </p>
                        <div className="flex gap-4 text-[#2a73e8] text-[13px]">
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${business.address}+${business.city}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 cursor-pointer">
                                <IoLocationOutline size={16} /> Directions
                            </a>
                            <button onClick={() => { navigator.clipboard.writeText(`${business.address}, ${business.city}`); alert("Copied!"); }} className="flex items-center gap-1 cursor-pointer">
                                <FaCopy size={14} /> Copy
                            </button>
                        </div>
                    </div>

                    <hr className="border-gray-300 my-3" />

                    {/* Business Details */}
                    <div className="space-y-4">

                        <div>
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsHoursOpen(!isHoursOpen)}>
                                <div>
                                    <h4 className="text-[13px] font-bold text-gray-800 mb-1">Business Hours</h4>
                                    <div className="flex items-center text-[13px] text-gray-600">
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
                                                const ampm = hour >= 12 ? "pm" : "am";
                                                const formattedHour = hour % 12 || 12;
                                                return `${formattedHour.toString().padStart(2, "0")}:${m} ${ampm}`;
                                            };

                                            return isClosed ? "Closed today" : `Open now : until ${formatTime(todayTiming?.close) || "late"}`;
                                        })()}
                                    </div>
                                </div>
                                <IoIosArrowForward className={`text-gray-600 font-bold transition-transform ${isHoursOpen ? 'rotate-90' : ''}`} />
                            </div>
                            
                            {isHoursOpen && business.timings && (
                                <div className="mt-3 bg-white border border-gray-100 rounded-lg p-3 max-w-2xl text-[13px] shadow-sm animate-fade-in">
                                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                                        const t = business.timings?.[day];
                                        const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === day;
                                        
                                        const formatTime = (time?: string) => {
                                            if (!time) return "";
                                            const [h, m] = time.split(":");
                                            if (!h || !m) return time;
                                            const hour = parseInt(h, 10);
                                            const ampm = hour >= 12 ? "PM" : "AM";
                                            const formattedHour = hour % 12 || 12;
                                            return `${formattedHour.toString().padStart(2, "0")}:${m} ${ampm}`;
                                        };

                                        return (
                                            <div key={day} className={`flex justify-between py-1.5 border-b border-gray-50 last:border-0 ${isToday ? 'font-bold text-gray-900 bg-gray-50/50 rounded px-1' : 'text-gray-600'}`}>
                                                <span className="capitalize">{day}</span>
                                                <span>
                                                    {t?.closed ? <span className="text-red-500 font-medium">Closed</span> : (t?.open && t?.close ? `${formatTime(t.open)} - ${formatTime(t.close)}` : "Not Set")}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {business.website && (
                            <div 
                                onClick={() => {
                                    if(business.website) {
                                        const url = business.website.startsWith('http') ? business.website : `https://${business.website}`;
                                        window.open(url, "_blank");
                                    }
                                }}
                                className="flex justify-between items-center cursor-pointer"
                            >
                                <h4 className="text-[13px] font-bold text-gray-800">Visit our website</h4>
                                <IoIosArrowForward className="text-gray-600 font-bold" />
                            </div>
                        )}

                        {business.socialLinks && business.socialLinks.length > 0 && (
                            <div>
                                <h4 className="text-[13px] font-bold text-gray-800 mb-2">Social Media</h4>
                                <div className="flex gap-4 text-gray-800 items-center">
                                    {business.socialLinks.map((link, idx) => {
                                        let Icon = FaLink;
                                        const lowerLink = link.toLowerCase();
                                        if (lowerLink.includes('instagram.com')) Icon = FaInstagram;
                                        else if (lowerLink.includes('facebook.com')) Icon = FaFacebookF;
                                        else if (lowerLink.includes('twitter.com') || lowerLink.includes('x.com')) Icon = FaTwitter;
                                        else if (lowerLink.includes('linkedin.com')) Icon = FaLinkedinIn;
                                        else if (lowerLink.includes('youtube.com')) Icon = FaYoutube;

                                        const url = link.startsWith('http') ? link : `https://${link}`;
                                        
                                        return (
                                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-blue-600 transition-colors">
                                                <Icon size={18} />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-300 my-3" />

                    {/* Whatsapp Box */}
                    <div className="mb-4">
                        <div className="bg-[#fff9f5] rounded-md p-3">
                            <p className="text-[12px] text-gray-700 mb-2">
                                Send your requirement on <span className="font-bold">WhatsApp</span>
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 flex items-center">
                                    <FaWhatsapp className="text-green-500 mr-2" size={14} />
                                    <input
                                        type="text"
                                        className="w-full text-[11px] text-gray-600 outline-none"
                                        defaultValue="Hi, I found your business on baynana"
                                        id="waRequirementInput"
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        const msg = (document.getElementById('waRequirementInput') as HTMLInputElement)?.value || "";
                                        window.open(`https://wa.me/91${business.mobile}?text=${encodeURIComponent(msg)}`, "_blank");
                                    }}
                                    className="bg-[#3F87DF] text-white p-2 rounded flex items-center justify-center"
                                >
                                    <RiSendPlaneFill size={14} />
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-500">Or call the business instantly</span>
                                <a href={`tel:${business.mobile}`} className="text-[11px] text-[#2a73e8] flex items-center gap-1 hover:underline">
                                    <FaPhoneAlt size={9} /> Call Now
                                </a>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-300 my-3" />

                    {/* Ratings & Reviews Full Width Block */}
                    <div className="pb-12">
                        <h3 className="text-[14px] font-bold text-gray-800 mb-4">Ratings & Reviews</h3>
                        <div className="bg-[#00c950] text-white text-3xl font-bold rounded w-14 h-14 flex items-center justify-center mb-6">
                            {business.rating ? business.rating.toFixed(1) : "0.0"}
                        </div>

                        <div className="space-y-4">
                            {(!business.reviews || business.reviews.length === 0) ? (
                                <div className="text-gray-500 text-sm">No reviews yet.</div>
                            ) : (
                                business.reviews.map((r, i) => (
                                    <div key={i} className="border-b border-gray-200 pb-4 last:border-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-gray-200 flex items-center justify-center text-gray-400">
                                                {r.userId?.profileImage ? (
                                                    <img src={r.userId.profileImage.startsWith('http') ? r.userId.profileImage : `${baseURL}/${r.userId.profileImage}`} alt={r.userId?.name || "User"} className="w-full h-full object-cover" />
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="font-bold text-[13px] text-gray-800 block">{r.userId?.name || r.userName || `User ${i + 1}`}</span>
                                                        <span className="text-[10px] text-gray-400 mt-0.5 block">{new Date(r.createdAt || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    {r.userId?._id === currentUserId && r._id && (
                                                        <div className="flex gap-3 text-gray-400">
                                                            <button
                                                                onClick={() => {
                                                                    setEditReviewData({ id: r._id!, rating: r.rating, review: r.review || '' });
                                                                    setIsReviewOpen(true);
                                                                }}
                                                                className="hover:text-blue-600 transition"
                                                                title="Edit Review"
                                                            >
                                                                <FaEdit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteReview(r._id!)}
                                                                className="hover:text-red-500 transition"
                                                                title="Delete Review"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-[#00c950] text-white px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold w-fit mb-2">
                                            {r.rating || "0"} <FaStar size={8} />
                                        </div>
                                        <p className="text-[12px] text-gray-600 leading-snug">
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
                existingReviewId={editReviewData.id}
                existingRating={editReviewData.rating}
                existingComment={editReviewData.review}
                onSuccess={() => {
                    fetchBusiness();
                }}
            />

            {/* Image Preview Modal */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-10 transition-opacity duration-300"
                    onClick={() => setPreviewImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[110]"
                        onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
                    >
                        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div 
                        className="relative max-w-full max-h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain border-2 border-white/10"
                        />
                    </div>
                </div>
            )}
        </UserLayout >
    );
};

export default BusinessDetailPage;
