import React, { useEffect, useState } from "react";
import { FiSearch, FiMapPin, FiMic, FiChevronDown, FiHeadphones } from "react-icons/fi";
import { FaUserCircle, FaBell } from "react-icons/fa";
import UserLayout from "../DesignLayout/UserLayout";
import SidebarMenu from "../Components/SidebarMenu";
import BusinessListCard from "../Components/BusinessListCard";
import axios from "axios";
import logo from '../Assets/new-logo.svg';
import { useNavigate } from 'react-router-dom';
import FreeListingPopup from '../Components/FreeListingPopup';
import LoginPopup from '../Components/LoginPopup';
import SignUpPopup from '../Components/SignUpPopup';
import HomeBanner from '../Components/HomeBanner';
import baseURL from "../config";

interface User {
  id?: string;
  name?: string;
  mobile?: string;
  profileImage?: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* 🔍 SEARCH STATES */
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  /* 📂 CATEGORY STATES */
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);

  /* 🖼️ BANNER STATE */
  const [banner, setBanner] = useState<any[]>([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  /* 📍 LOCATION STATE */
  const [locationName, setLocationName] = useState("Select Location");

  /* 🔐 POPUP STATES */
  const [isFreeListingPopupOpen, setIsFreeListingPopupOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isSignUpPopupOpen, setIsSignUpPopupOpen] = useState(false);

  // AUTH CHECK
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const userName = localStorage.getItem('userName');
      const userPhone = localStorage.getItem('userPhone');
      const profileImage = localStorage.getItem('profileImage');
      if (userName || userPhone) {
        setCurrentUser({
          name: userName || undefined,
          mobile: userPhone || undefined,
          profileImage: profileImage || undefined
        });
      } else {
        setCurrentUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('focus', checkAuth);
    return () => window.removeEventListener('focus', checkAuth);
  }, []);

  // LOCATION DETECTION — reusable function
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationName("Select Location");
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocationName("Locating...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          .then((res) => res.json())
          .then((data) => {
            const city = data.city || data.locality || "Current Location";
            const country = data.countryCode || "";
            setLocationName(`${city}, ${country}`);
          })
          .catch(() => setLocationName("Select Location"));
      },
      (error) => {
        console.error("Location error:", error);
        setLocationName("Select Location");
      }
    );
  };

  // Location is now only requested when user clicks on "Select Location"

  // FETCH DATA
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/user/category/list`);
        setDynamicCategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();

    const fetchBanner = async () => {
      try {
        setBannerLoading(true);
        const res = await axios.get(`${baseURL}/api/user/banners`);
        setBanner(res.data || []);
      } catch (err) {
        console.log("Banner fetch error", err);
      } finally {
        setBannerLoading(false);
      }
    };
    fetchBanner();
  }, []);

  /* 🔍 SEARCH API (DEBOUNCE) */
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseURL}/api/user/search`, {
          params: { q: searchText },
        });
        setSearchResults(res.data.businesses || []);
      } catch (err) {
        console.log("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [searchText]);

  /* 🎤 VOICE SEARCH */
  const handleVoiceSearch = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchText(transcript);
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  };

  /* Category color palette for icons */
  const categoryColors = [
    { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100' },
    { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-100' },
    { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
    { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
  ];

  return (
    <UserLayout>
      <SidebarMenu open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={currentUser} />

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="w-full min-h-screen bg-[#f5f6fa] pb-20 font-sans">

        {/* ═══════════════════════════════════════ */}
        {/* 1️⃣ HEADER — Location + Bell + Profile  */}
        {/* ═══════════════════════════════════════ */}
        <div className="bg-white px-4 lg:px-8 pt-3 pb-2 sticky top-0 z-50 shadow-sm">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            {/* Left: Location */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={requestLocation}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <FiMapPin className="text-white" size={14} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[15px] font-bold text-gray-800 leading-tight">{locationName}</span>
                <FiChevronDown className="text-gray-400" size={14} />
              </div>
            </div>

            {/* Right: Bell + Auth */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-all">
                <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white z-10"></span>
                <FaBell className="text-white" size={16} />
              </div>

              {/* Auth / Profile */}
              {!isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLoginPopupOpen(true)}
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 text-xs font-bold px-3.5 py-2 rounded-full transition-all border border-blue-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsSignUpPopupOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-sm"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div onClick={() => setSidebarOpen(true)} className="relative cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm hover:shadow-md transition-all overflow-hidden">
                    {currentUser?.profileImage ? (
                      <img src={`${baseURL}/${currentUser.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FaUserCircle size={20} className="text-white" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* 2️⃣ SEARCH BAR                          */}
        {/* ═══════════════════════════════════════ */}
        <div className="bg-white px-4 lg:px-8 pt-3 pb-5 shadow-sm border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center bg-[#f0f1f5] rounded-xl h-12 lg:h-14 px-4 border border-gray-200 hover:border-blue-300 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-md transition-all duration-300 max-w-2xl lg:max-w-none">
              <FiSearch className="text-gray-400 flex-shrink-0" size={20} />
              <input
                type="text"
                placeholder="Search for anything..."
                className="w-full h-full px-3 text-gray-700 bg-transparent outline-none placeholder-gray-400 font-medium text-sm"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <div className="pl-3 border-l border-gray-300 h-5 flex items-center cursor-pointer" onClick={handleVoiceSearch}>
                <FiMic className={`transition-colors flex-shrink-0 ${isListening ? 'text-red-500 animate-pulse' : 'text-blue-500 hover:text-blue-600'}`} size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* MAIN CONTENT                            */}
        {/* ═══════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto">

          {/* SEARCH RESULTS MODE */}
          {searchText ? (
            <div className="px-4 mt-4">
              {loading && <p className="text-center text-gray-400 py-10">Searching...</p>}
              {!loading && searchResults.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500 font-medium">No results found</p>
                </div>
              )}
              <div className="space-y-4">
                {searchResults.map((biz) => (
                  <BusinessListCard key={biz._id} business={biz} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* ═══════════════════════════════════════ */}
              {/* 3️⃣ BANNER CAROUSEL                     */}
              {/* ═══════════════════════════════════════ */}
              <div className="px-4 lg:px-8 mt-6">
                <div className="rounded-2xl overflow-hidden shadow-md relative">
                  <HomeBanner banner={banner} loading={bannerLoading} />
                  {/* FEATURED Tag Overlay */}
                  {banner && banner.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pointer-events-none">
                      <span className="inline-block bg-blue-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-md mb-2 tracking-wider">Featured</span>
                      <h3 className="text-white text-base sm:text-lg font-bold leading-snug drop-shadow-lg">{banner[0]?.title || 'Discover Top Services'}</h3>
                      <p className="text-white/80 text-xs sm:text-sm mt-0.5">{banner[0]?.subtitle || 'Find the best deals near you'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ═══════════════════════════════════════ */}
              {/* 4️⃣ CATEGORY GRID (2 rows × 4 cols)    */}
              {/* ═══════════════════════════════════════ */}
              <div className="px-4 lg:px-8 mt-6">
                <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-y-5 gap-x-3 lg:gap-x-4">
                    {dynamicCategories.map((cat, index) => {
                      const color = categoryColors[index % categoryColors.length];
                      return (
                        <div
                          key={cat._id}
                          className="flex flex-col items-center gap-2 cursor-pointer group"
                          onClick={() => navigate(`/category/${cat._id}`)}
                        >
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-[4.5rem] lg:h-[4.5rem] rounded-2xl ${color.bg} ${color.border} border flex items-center justify-center group-hover:shadow-md group-hover:scale-105 transition-all duration-200 overflow-hidden`}>
                            {cat.icon ? (
                              <span className={`text-2xl ${color.text}`}>{cat.icon}</span>
                            ) : (
                              <img
                                src={`${baseURL}/uploads/category/${cat.image}`}
                                alt={cat.name}
                                className="w-8 h-8 sm:w-9 sm:h-9 object-cover"
                              />
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs lg:text-sm font-medium text-gray-600 text-center leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 px-1">
                            {cat.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════ */}
              {/* 5️⃣ SOCIAL PROOF BAR                    */}
              {/* ═══════════════════════════════════════ */}


              {/* ═══════════════════════════════════════ */}
              {/* 6️⃣ POPULAR SERVICES — Horizontal Scroll */}
              {/* ═══════════════════════════════════════ */}
              <div className="mt-6">
                <div className="flex justify-between items-center px-4 lg:px-8 mb-3">
                  <h3 className="text-lg font-bold text-gray-800">Popular Services</h3>
                  <span className="text-blue-600 text-sm font-semibold cursor-pointer hover:text-blue-700 transition-colors">View All</span>
                </div>

                <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 lg:gap-4 overflow-x-auto md:overflow-visible hide-scrollbar px-4 lg:px-8 pb-2">
                  {dynamicCategories.slice(0, 6).map((cat, index) => {
                    const color = categoryColors[index % categoryColors.length];
                    return (
                      <div
                        key={`popular-${cat._id}`}
                        className="flex-shrink-0 w-[130px] sm:w-40 md:w-auto cursor-pointer group"
                        onClick={() => navigate(`/category/${cat._id}`)}
                      >
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-200">
                          {/* Image */}
                          <div className={`w-full h-24 sm:h-28 lg:h-40 ${color.bg} flex items-center justify-center relative overflow-hidden`}>
                            {cat.image ? (
                              <img
                                src={`${baseURL}/uploads/category/${cat.image}`}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <span className={`text-4xl ${color.text}`}>{cat.icon || '📦'}</span>
                            )}
                          </div>
                          {/* Info */}
                          <div className="p-2.5">
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{cat.name}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Explore services</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ═══════════════════════════════════════ */}
              {/* 7️⃣ & 8️⃣ CTAs — Side by side on desktop  */}
              {/* ═══════════════════════════════════════ */}
              <div className="px-4 lg:px-8 mt-6 mb-8 flex flex-col md:flex-row gap-4">
                {/* Need Help CTA */}
                <div className="flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-lg shadow-blue-200/50">
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full blur-xl -ml-6 -mb-6"></div>

                  <div className="relative z-10 flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-white text-lg sm:text-xl font-bold mb-1.5">Need help finding?</h3>
                      <p className="text-blue-100 text-sm leading-relaxed mb-4">
                        Tell us what you need and we'll find the best experts for you.
                      </p>
                      <button
                        onClick={() => isLoggedIn ? navigate('/user/add-business') : setIsFreeListingPopupOpen(true)}
                        className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
                      >
                        Post Your Requirement
                      </button>
                    </div>
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FiHeadphones className="text-white" size={24} />
                    </div>
                  </div>
                </div>

                {/* Grow Your Business CTA */}
                <div className="flex-1 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-lg">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -ml-6 -mb-6"></div>

                  <div className="relative z-10 text-center">
                    <h3 className="text-white text-lg sm:text-xl font-bold mb-2">Grow Your Business</h3>
                    <p className="text-gray-300 text-sm mb-4">List your business for free and reach millions of customers.</p>
                    <button
                      onClick={() => isLoggedIn ? navigate('/user/add-business') : setIsFreeListingPopupOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                    >
                      List for Free
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* POPUPS */}
      {isFreeListingPopupOpen && <FreeListingPopup onClose={() => setIsFreeListingPopupOpen(false)} />}
      {
        isLoginPopupOpen && (
          <LoginPopup
            onClose={() => setIsLoginPopupOpen(false)}
            onLoginSuccess={checkAuth}
          />
        )
      }
      {
        isSignUpPopupOpen && (
          <SignUpPopup
            onClose={() => setIsSignUpPopupOpen(false)}
            onSignUpSuccess={checkAuth}
          />
        )
      }
    </UserLayout >
  );
}

export default HomePage;
