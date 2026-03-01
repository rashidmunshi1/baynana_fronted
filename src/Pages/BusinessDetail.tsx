import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaArrowLeft, FaStar, FaMapMarkerAlt, FaPhoneAlt, FaShareAlt,
    FaClock, FaCheckCircle, FaCrown, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import UserLayout from "../DesignLayout/UserLayout";
import baseURL from "../config";

interface BusinessDetail {
    _id: string;
    businessName: string;
    ownerName: string;
    mobile: string;
    address: string;
    city: string;
    pincode: string;
    locationUrl?: string | null;
    description?: string;
    category: { _id: string; name: string };
    subcategories: { _id: string; name: string }[];
    services: string[];
    images: string[];
    timings?: Record<string, { open?: string; close?: string; closed?: boolean }>;
    isPaid: boolean;
    paidAmount: number;
    paidDays: number;
    paidExpiry: string | null;
    status: boolean;
    approvalStatus?: string;
    rating?: number;
    ratingCount?: number;
    createdAt: string;
}

const BusinessDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<BusinessDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${baseURL}/api/user/business/${id}`);
                setBusiness(res.data);
            } catch (err: any) {
                console.error("Failed to fetch business:", err);
                setError("Business not found");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchBusiness();
    }, [id]);

    const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const dayLabels: Record<string, string> = {
        monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
        friday: "Fri", saturday: "Sat", sunday: "Sun"
    };

    const today = daysOrder[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: business?.businessName,
                text: `Check out ${business?.businessName}`,
                url: window.location.href,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const prevImage = () => {
        if (business && business.images.length > 0) {
            setCurrentImage((prev) => (prev === 0 ? business.images.length - 1 : prev - 1));
        }
    };

    const nextImage = () => {
        if (business && business.images.length > 0) {
            setCurrentImage((prev) => (prev === business.images.length - 1 ? 0 : prev + 1));
        }
    };

    if (loading) {
        return (
            <UserLayout>
                <div className="min-h-screen bg-gray-50 pb-20">
                    {/* Shimmer Header */}
                    <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm">
                        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    {/* Shimmer Image */}
                    <div className="w-full h-56 bg-gray-200 animate-pulse"></div>
                    {/* Shimmer Content */}
                    <div className="p-4 space-y-4">
                        <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse"></div>
                        <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse"></div>
                        <div className="h-4 w-full rounded bg-gray-200 animate-pulse"></div>
                        <div className="h-20 w-full rounded-xl bg-gray-200 animate-pulse"></div>
                    </div>
                </div>
            </UserLayout>
        );
    }

    if (error || !business) {
        return (
            <UserLayout>
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                    <p className="text-gray-500 text-lg font-medium">{error || "Business not found"}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-violet-600 font-semibold hover:underline"
                    >
                        ← Go Back
                    </button>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="min-h-screen bg-gray-50 pb-24 font-sans">

                {/* ── STICKY HEADER ── */}
                <div className="bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-700"
                        >
                            <FaArrowLeft size={14} />
                        </button>
                        <h1 className="text-base font-bold text-gray-800 truncate">{business.businessName}</h1>
                    </div>
                    <button
                        onClick={handleShare}
                        className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-violet-50 hover:text-violet-600 transition text-gray-600"
                    >
                        <FaShareAlt size={14} />
                    </button>
                </div>

                {/* ── IMAGE CAROUSEL ── */}
                {business.images && business.images.length > 0 ? (
                    <div className="relative w-full h-56 sm:h-72 lg:h-96 bg-black overflow-hidden">
                        <img
                            src={`${baseURL}/uploads/business/${business.images[currentImage]}`}
                            alt={business.businessName}
                            className="w-full h-full object-cover transition-all duration-300"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

                        {business.images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white transition shadow"
                                >
                                    <FaChevronLeft size={12} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white transition shadow"
                                >
                                    <FaChevronRight size={12} />
                                </button>
                                {/* Dots */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {business.images.map((_, i) => (
                                        <span
                                            key={i}
                                            className={`w-2 h-2 rounded-full transition-all duration-200 ${i === currentImage ? 'bg-white w-5' : 'bg-white/50'}`}
                                        ></span>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Image counter */}
                        <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                            {currentImage + 1} / {business.images.length}
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No images available</span>
                    </div>
                )}

                {/* ── MAIN INFO ── */}
                <div className="px-4 -mt-4 relative z-10">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">

                        {/* Name + Rating */}
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">{business.businessName}</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {business.category?.name || "Uncategorized"}
                                    {business.subcategories && business.subcategories.length > 0 && (
                                        <span> • {business.subcategories.map(s => s.name).join(", ")}</span>
                                    )}
                                </p>
                            </div>

                            {/* Rating Badge */}
                            {business.rating && business.rating > 0 ? (
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="bg-green-600 text-white text-sm font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                                        {business.rating} <FaStar size={10} />
                                    </div>
                                    {business.ratingCount ? (
                                        <span className="text-[10px] text-gray-400 mt-1">{business.ratingCount} ratings</span>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>

                        {/* Paid Badge */}
                        {business.isPaid && (
                            <div className="mt-3 flex items-center gap-2">
                                <span className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                                    <FaCrown size={11} className="text-amber-500" /> Premium Listing
                                </span>
                                {business.paidExpiry && (
                                    <span className={`text-xs font-medium ${new Date(business.paidExpiry) < new Date() ? 'text-red-500' : 'text-emerald-600'}`}>
                                        {new Date(business.paidExpiry) < new Date()
                                            ? `Expired: ${new Date(business.paidExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
                                            : `Valid till: ${new Date(business.paidExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
                                        }
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Address */}
                        <div className="mt-4 flex items-start gap-2.5">
                            <FaMapMarkerAlt className="text-violet-500 mt-0.5 flex-shrink-0" size={14} />
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {business.address}, {business.city} - {business.pincode}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-3">
                            <a
                                href={`tel:${business.mobile}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition active:scale-[0.98]"
                            >
                                <FaPhoneAlt size={13} /> Call Now
                            </a>
                            {business.locationUrl && (
                                <a
                                    href={business.locationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition active:scale-[0.98]"
                                >
                                    <FiExternalLink size={14} /> Get Directions
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── DESCRIPTION ── */}
                {business.description && (
                    <div className="px-4 mt-4">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-2">About</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{business.description}</p>
                        </div>
                    </div>
                )}

                {/* ── SERVICES ── */}
                {business.services && business.services.length > 0 && (
                    <div className="px-4 mt-4">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-3">Services</h3>
                            <div className="flex flex-wrap gap-2">
                                {business.services.map((service, i) => (
                                    <span
                                        key={i}
                                        className="bg-violet-50 text-violet-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-violet-100"
                                    >
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TIMINGS ── */}
                {business.timings && (
                    <div className="px-4 mt-4">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <FaClock className="text-violet-500" size={14} /> Business Hours
                            </h3>
                            <div className="space-y-2">
                                {daysOrder.map((day) => {
                                    const timing = business.timings?.[day];
                                    const isToday = day === today;
                                    return (
                                        <div
                                            key={day}
                                            className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${isToday ? 'bg-violet-50 border border-violet-100' : ''}`}
                                        >
                                            <span className={`font-medium ${isToday ? 'text-violet-700' : 'text-gray-700'}`}>
                                                {dayLabels[day]}
                                                {isToday && <span className="text-[10px] ml-1.5 text-violet-500 font-bold">(Today)</span>}
                                            </span>
                                            {timing?.closed ? (
                                                <span className="text-red-500 font-medium text-xs">Closed</span>
                                            ) : timing?.open && timing?.close ? (
                                                <span className={`font-medium text-xs ${isToday ? 'text-violet-700' : 'text-gray-600'}`}>
                                                    {timing.open} — {timing.close}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Not set</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── OWNER INFO ── */}
                <div className="px-4 mt-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <h3 className="text-base font-bold text-gray-800 mb-3">Contact Person</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {business.ownerName?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{business.ownerName}</p>
                                <p className="text-xs text-gray-500">{business.mobile}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── LISTED SINCE ── */}
                <div className="px-4 mt-4 mb-6">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-500" size={14} />
                            <span className="text-sm text-gray-600">Listed since</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                            {new Date(business.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                </div>

            </div>
        </UserLayout>
    );
};

export default BusinessDetailPage;
