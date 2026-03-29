import React, { useEffect, useState, useRef } from "react";
import { FiSearch, FiMapPin, FiMic, FiChevronDown, FiChevronRight, FiPlay, FiBriefcase, FiClock, FiX, FiTrash2 } from "react-icons/fi";
import { FaUserCircle, FaBell } from "react-icons/fa";
import UserLayout from "../DesignLayout/UserLayout";
import SidebarMenu from "../Components/SidebarMenu";
import BusinessListCard from "../Components/BusinessListCard";
import axios from "axios";
import logo from '../Assets/new-baynana-logo.svg';
import { useNavigate } from 'react-router-dom';
import FreeListingPopup from '../Components/FreeListingPopup';
import LoginPopup from '../Components/LoginPopup';
import SignUpPopup from '../Components/SignUpPopup';
import HomeBanner from '../Components/HomeBanner';
import baseURL from "../config";
import LoadingSpinner from "../Components/LoadingSpinner";

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

  /* 📜 SEARCH HISTORY */
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const trendingSearches = ["Plumbers", "Doctors", "Grocery", "Restaurants", "Real Estate", "Electricians", "Travel Agents", "Carpenters"];

  /* 📂 CATEGORY STATES */
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);

  /* 🖼️ BANNER STATE */
  const [banner, setBanner] = useState<any[]>([]);
  const [bannerLoading, setBannerLoading] = useState(false);

  /* 🎥 VIDEO STATE */
  const [videos, setVideos] = useState<any[]>([]);

  /* 🎉 EVENT BANNER STATE */
  const [eventBanners, setEventBanners] = useState<any[]>([]);

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

  // LOAD SEARCH HISTORY from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch { }
    }
  }, []);

  // CLOSE SEARCH HISTORY dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/user/videos`);
        setVideos(res.data || []);
      } catch (err) {
        console.log("Video fetch error", err);
      }
    };
    fetchVideos();

    const fetchEventBanners = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/user/event-banners`);
        setEventBanners(res.data || []);
      } catch (err) {
        console.log("Event Banner fetch error", err);
      }
    };
    fetchEventBanners();
  }, []);

  /* 📜 SEARCH HISTORY helpers */
  const addToSearchHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 15); // keep max 15 items
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromSearchHistory = (term: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item => item !== term);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

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
        // Save to search history when results are fetched
        addToSearchHistory(searchText);
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
      alert('Voice search is not supported in this browser. Please use Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Better for Indian accents

    recognition.onstart = () => {
      setIsListening(true);
      setIsSearchMode(true);
      setIsSearchFocused(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchText(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone permission denied. Please allow microphone access in browser settings.");
      }
    };
    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
    }
  };

  /* Category color palette for icons */
  const categoryColors = [
    { bg: 'bg-[#fbeeed]', text: 'text-red-500' },    // Doctors-like red
    { bg: 'bg-[#f0f4fc]', text: 'text-blue-600' },   // Travel-like blue
    { bg: 'bg-[#f1fbfa]', text: 'text-cyan-600' },   // Edu-like cyan
    { bg: 'bg-[#fbf1ef]', text: 'text-orange-500' }, // Rent-like orange
    { bg: 'bg-[#f3f0fb]', text: 'text-purple-600' }, // Real Est-like purple
    { bg: 'bg-[#eff6fb]', text: 'text-blue-500' },   // Restaurant-like blue
    { bg: 'bg-[#fcede8]', text: 'text-red-400' },    // Elect-like light red
    { bg: 'bg-[#edf9f3]', text: 'text-green-600' },  // Plumber-like green
    { bg: 'bg-[#fbf0fb]', text: 'text-pink-600' },   // Grocery-like pink
  ];

  return (
    <UserLayout>
      <SidebarMenu open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={currentUser} />

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Main container sets standard max-widths on larger screens and a full width on mobile.*/}
      <div className="w-full min-h-screen bg-white pb-24 font-sans border-x border-gray-50/50">

        {/* ═══════════════════════════════════════ */}
        {/* 1️⃣ HEADER — Blue Background + Search + Banner */}
        {/* ═══════════════════════════════════════ */}
        <div
          className="bg-[#4285F4] pt-5 pb-9 sm:pb-12 px-4 sm:px-8 shadow-sm relative w-full mx-auto"
          style={{ borderBottomLeftRadius: "50% 40px", borderBottomRightRadius: "50% 40px" }}
        >

          <div className="max-w-7xl mx-auto">
            {/* Top row: Location, Logo, Profile */}
            <div className="flex justify-between items-center w-full">
              {/* Desktop Location (or spacer on mobile) */}
              <div className="flex-1 flex items-center justify-start">
                {isSearchMode ? (
                  <button
                    onClick={() => {
                      setIsSearchMode(false);
                      setIsSearchFocused(false);
                      setSearchText("");
                    }}
                    className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <FiChevronDown className="rotate-90" size={20} />
                    <span className="text-[13px] font-bold">Back</span>
                  </button>
                ) : (
                  null
                  /* 
                  <div className="hidden sm:flex items-center gap-1 cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-white transition-colors" onClick={requestLocation}>
                    <FiMapPin size={14} />
                    <span className="text-[13px] font-bold tracking-wide">{locationName}</span>
                    <FiChevronDown size={14} />
                  </div>
                  */
                )}
              </div>

              {/* Logo Center */}
              <div className="flex-shrink-0 flex justify-center items-center px-1 sm:px-2">
                {!isSearchMode && (
                  <img src={logo} alt="Baynana" className="h-[40px] sm:h-[48px] lg:h-[56px] object-contain" />
                )}
              </div>

              {/* Right Profile Icon / Auth Buttons */}
              <div className="flex-1 flex justify-end items-center">
                {!isLoggedIn ? (
                  !isSearchMode && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => setIsLoginPopupOpen(true)}
                        className="text-white text-[10px] sm:text-xs font-bold bg-black/20 hover:bg-black/30 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => setIsSignUpPopupOpen(true)}
                        className="text-[#3F87DF] text-[10px] sm:text-xs font-bold bg-white hover:bg-gray-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors shadow-sm"
                      >
                        Register
                      </button>
                    </div>
                  )
                ) : (
                  !isSearchMode && (
                    <div onClick={() => setSidebarOpen(true)} className="cursor-pointer">
                      <div className="w-[30px] h-[30px] rounded-full bg-black/40 text-white flex items-center justify-center shadow-sm overflow-hidden">
                        {currentUser?.profileImage ? (
                          <img src={`${baseURL}/${currentUser.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <FaUserCircle size={18} />
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="mt-5 w-full relative" ref={searchContainerRef}>
              <div className="flex items-center bg-white rounded-[4px] h-[40px] px-3 shadow-sm lg:h-[48px]">
                <button onClick={() => { (searchContainerRef.current?.querySelector('input') as HTMLInputElement)?.focus(); }} className="flex items-center">
                  <FiSearch className="text-gray-600 lg:w-5 lg:h-5" size={16} />
                </button>
                <input
                  type="text"
                  placeholder="Search Businesses"
                  className="w-full h-full px-2 lg:px-4 text-gray-800 bg-transparent outline-none placeholder-gray-400 font-medium text-[13px] lg:text-base"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setIsSearchMode(true);
                  }}
                />
                {searchText && (
                  <button onClick={() => { setSearchText(''); setSearchResults([]); }} className="pr-1">
                    <FiX className="text-gray-400 hover:text-gray-600 transition-colors" size={16} />
                  </button>
                )}
                <button onClick={handleVoiceSearch} className="pl-2 lg:pl-4 border-l border-gray-100 flex items-center h-full">
                  <FiMic className={`${isListening ? 'text-red-500 animate-pulse' : 'text-gray-600'} transition-colors ml-1 lg:w-5 lg:h-5`} size={16} />
                </button>
              </div>

              {/* 📜 SEARCH HISTORY DROPDOWN - Hidden in Search Mode because it shows in body */}
              {isSearchFocused && !isSearchMode && !searchText && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-[320px] overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                    <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Recent Searches</p>
                    <button
                      onClick={clearSearchHistory}
                      className="text-[11px] font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                      <FiTrash2 size={12} />
                      Clear All
                    </button>
                  </div>
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <div
                        className="flex items-center gap-3 flex-1 min-w-0"
                        onClick={() => {
                          setSearchText(item);
                          setIsSearchFocused(false);
                        }}
                      >
                        <FiClock className="text-gray-400 flex-shrink-0" size={14} />
                        <span className="text-[13px] text-gray-700 font-medium truncate">{item}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromSearchHistory(item);
                        }}
                        className="text-gray-300 hover:text-red-400 transition-colors ml-2 opacity-0 group-hover:opacity-100"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Banner Block — Hidden when search is active */}
            {!isSearchMode && !searchText && (
              <div className="mt-4 relative z-0">
                <HomeBanner banner={banner} loading={bannerLoading} />
                {(!banner || banner.length === 0) && !bannerLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl shadow-sm aspect-[16/7] sm:aspect-[21/9] md:aspect-[3/1] lg:aspect-[4/1]">
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium z-10">Paid Promotional Content Here</p>
                  </div>
                )}
              </div>
            )}


          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* MAIN BODY                               */}
        {/* ═══════════════════════════════════════ */}
        {isSearchMode && !searchText ? (
          <div className="max-w-7xl mx-auto px-4 mt-8">
            {/* 🕰️ RECENT SEARCHES */}
            {searchHistory.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <FiClock className="text-blue-500" />
                    Recent Searches
                  </h3>
                  <button onClick={clearSearchHistory} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors flex items-center gap-2 group"
                      onClick={() => setSearchText(item)}
                    >
                      <span>{item}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromSearchHistory(item);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 📈 TRENDING SEARCHES */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term, index) => (
                  <div
                    key={index}
                    onClick={() => setSearchText(term)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors flex items-center gap-2"
                  >
                    <FiSearch size={14} className="opacity-70" />
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : searchText ? (
          <div className="max-w-7xl mx-auto px-4 mt-6">
            {loading && <LoadingSpinner text="Searching..." size={12} />}
            {!loading && searchResults.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 font-medium">No results found for "{searchText}"</p>
              </div>
            )}
            <div className="space-y-4">
              {searchResults.map((biz) => (
                <BusinessListCard key={biz._id} business={biz} />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* 3️⃣ CATEGORY GRID */}
            <div className="px-4 sm:px-8 mt-8">
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                {dynamicCategories.slice(0, 9).map((cat, index) => {
                  const color = categoryColors[index % categoryColors.length];
                  return (
                    <div key={cat._id} className="flex flex-col items-center gap-2 cursor-pointer w-[64px] sm:w-[76px] md:w-[84px] lg:w-[100px] group" onClick={() => navigate(`/category/${cat._id}`)}>
                      <div className={`w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] md:w-[76px] md:h-[76px] lg:w-[90px] lg:h-[90px] ${cat.icon ? color.bg : 'bg-gray-50 border border-gray-100'} flex items-center justify-center rounded-xl lg:rounded-2xl group-hover:shadow-md transition-all overflow-hidden`}>
                        {cat.icon ? (
                          <span className={`text-[20px] sm:text-2xl md:text-3xl lg:text-4xl ${color.text}`}>{cat.icon}</span>
                        ) : (
                          <img src={`${baseURL}/uploads/category/${cat.image}`} alt={cat.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] md:text-xs font-bold text-gray-800 text-center leading-tight break-words px-0.5">
                        {cat.name}
                      </p>
                    </div>
                  );
                })}
                {/* Static Show More Icon */}
                {dynamicCategories.length > 4 && (
                  <div className="flex flex-col items-center gap-2 cursor-pointer w-[64px] sm:w-[76px] md:w-[84px] lg:w-[100px] group" onClick={() => navigate('/categories')}>
                    <div className="w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] md:w-[76px] md:h-[76px] lg:w-[90px] lg:h-[90px] bg-white border border-gray-100 flex items-center justify-center rounded-xl lg:rounded-2xl group-hover:shadow-md transition-all overflow-hidden">
                      <div className="w-[30px] h-[30px] sm:w-[36px] sm:h-[36px] md:w-[40px] md:h-[40px] lg:w-[48px] lg:h-[48px] bg-[#4285F4] rounded-full flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors">
                        <FiChevronDown size={24} className="text-white lg:w-7 lg:h-7" />
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-[11px] md:text-xs font-bold text-gray-800 text-center leading-tight px-0.5">
                      Show More
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 4️⃣ LIST YOUR BUSINESS FREE (Strip banner) */}
            <div className="px-4 sm:px-8 mt-10">
              <div className="border border-[#abc9fc] rounded-[8px] py-3 px-4 flex items-center justify-between sm:justify-start sm:gap-6 shadow-sm relative overflow-hidden bg-gradient-to-r from-[#f5f9ff] to-white lg:py-5 lg:px-8 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 pl-1">
                  <h3 className="text-[14px] sm:text-base lg:text-lg font-extrabold text-[#3a3a3a]">List Your Business</h3>
                  <span className="bg-[#fe4b49] text-white text-[10px] sm:text-xs lg:text-sm font-bold px-2 py-0.5 rounded-[4px] shadow-[0_1px_3px_rgba(254,75,73,0.3)]">Free</span>
                </div>
                <button
                  onClick={() => isLoggedIn ? navigate('/user/add-business') : setIsFreeListingPopupOpen(true)}
                  className="bg-[#3F87DF] hover:bg-[#326CB2] text-white text-[12px] sm:text-sm lg:text-base font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-[6px] active:scale-95 transition-transform ml-auto shadow-sm"
                >
                  Start Now
                </button>
              </div>
            </div>

            {/* 6️⃣ EVENTS & ISLAMIC GATHERINGS */}
            {eventBanners.length > 0 && (
              <div className="mt-10">
                <div className="flex justify-between items-center px-4 sm:px-8 mb-4 cursor-pointer" onClick={() => navigate('/events')}>
                  <h3 className="text-[16px] sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800">Events & Islamic Gatherings</h3>
                  <div className="flex items-center gap-1 text-[#4285F4]">
                    {eventBanners.length > 4 && <span className="text-[11px] sm:text-xs font-bold">View All</span>}
                    <FiChevronRight size={20} className="font-bold xl:w-6 xl:h-6" />
                  </div>
                </div>
                <div className="flex overflow-x-auto hide-scrollbar px-4 sm:px-8 gap-4 md:gap-6 lg:gap-8 pb-4 snap-x">
                  {eventBanners.slice(0, 4).map((eventBanner) => (
                    <div key={eventBanner._id} className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[240px] lg:w-[280px] xl:w-[340px] snap-center cursor-pointer">
                      <div className="w-full aspect-[4/5] bg-[#fdf3f0] rounded-[8px] xl:rounded-[12px] overflow-hidden hover:shadow-md transition-all border border-gray-100">
                        <img
                          src={`${baseURL}/${eventBanner.image}`}
                          alt={eventBanner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7️⃣ LEARN ISLAMIC METHOD OF BUSINESS */}
            {videos.length > 0 && (
              <div className="mt-10">
                <div className="flex justify-between items-center px-4 sm:px-8 mb-4 cursor-pointer" onClick={() => navigate('/videos')}>
                  <h3 className="text-[16px] sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800">Learn Islamic Method of Business</h3>
                  <div className="flex items-center gap-1 text-[#4285F4]">
                    {videos.length > 4 && <span className="text-[11px] sm:text-xs font-bold">View All</span>}
                    <FiChevronRight size={20} className="font-bold xl:w-6 xl:h-6" />
                  </div>
                </div>
                <div className="flex overflow-x-auto hide-scrollbar px-4 sm:px-8 gap-4 md:gap-6 lg:gap-8 pb-4 snap-x">
                  {videos.slice(0, 4).map((video) => (
                    <div key={video._id} className="flex-shrink-0 w-[200px] sm:w-[260px] md:w-[320px] lg:w-[380px] xl:w-[460px] snap-center cursor-pointer group">
                      <div className="w-full aspect-[16/9] bg-[#f0ecfc] rounded-[8px] xl:rounded-[12px] overflow-hidden flex items-center justify-center relative hover:shadow-md transition-all border border-gray-100">
                        <video
                          src={`${baseURL}/${video.videoPath}`}
                          className="w-full h-full object-cover"
                          controls
                          playsInline
                          preload="metadata"
                        />
                      </div>
                      <p className="text-[9px] sm:text-[10px] md:text-xs xl:text-sm text-gray-800 font-medium mt-1.5 xl:mt-2.5 leading-[1.2] lg:leading-[1.4] line-clamp-2 pr-2">
                        {video.title} {video.description ? `- ${video.description}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8️⃣ DONATE TO NOOR E IMAN */}
            <div className="mt-14 mb-10 px-4 sm:px-8 text-center flex flex-col items-center" style={{ fontFamily: "'Roboto', sans-serif" }}>
              <h2 className="text-[22px] sm:text-2xl lg:text-3xl font-extrabold text-[#3a3a3a] mb-5">Donate to Noor E Iman</h2>

              <div className="w-28 h-28 sm:w-36 sm:h-36 mb-6">
                <img src="/noor-imaan-1.svg" alt="Noor E Iman Logo" className="w-full h-full object-contain" />
              </div>

              <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-800 font-medium max-w-[280px] sm:max-w-md lg:max-w-xl mb-6 lg:mb-8 leading-relaxed">
                To support baynana and our other work you can donate lillah, sadqah and zakat to our organisation. <span className="text-black font-extrabold border-b border-black pb-[0.5px] cursor-pointer">Learn More</span>
              </p>

              <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 justify-center bg-white/50 p-3 sm:p-4 lg:p-5 rounded-lg">
                <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] lg:w-[100px] lg:h-[100px] bg-white border-4 border-gray-900 flex items-center justify-center p-1 rounded-sm shadow-sm">
                  {/* Simulated QR Pattern for missing image */}
                  <div className="w-full h-full bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:10px_10px] bg-[position:0_0,5px_5px] opacity-80"></div>
                </div>
                <div className="text-left text-[9px] sm:text-[11px] lg:text-sm xl:text-base text-gray-800 font-medium leading-[1.3] lg:leading-[1.5] flex flex-col gap-0.5 lg:gap-1">
                  <p>Bank of Baroda</p>
                  <p>78020100009407</p>
                  <p>ImranHusain Saiyad</p>
                  <p>BARBOVJRAJK</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* POPUPS */}
      {isFreeListingPopupOpen && <FreeListingPopup onClose={() => setIsFreeListingPopupOpen(false)} />}
      {isLoginPopupOpen && <LoginPopup onClose={() => setIsLoginPopupOpen(false)} onLoginSuccess={checkAuth} />}
      {isSignUpPopupOpen && <SignUpPopup onClose={() => setIsSignUpPopupOpen(false)} onSignUpSuccess={checkAuth} />}
    </UserLayout >
  );
}

export default HomePage;
