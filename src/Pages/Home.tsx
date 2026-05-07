import React, { useEffect, useState, useRef } from "react";
import { FiSearch, FiMapPin, FiMic, FiChevronDown, FiChevronRight, FiPlay, FiBriefcase, FiClock, FiX, FiTrash2, FiArrowRight, FiTrendingUp } from "react-icons/fi";
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
import { motion, AnimatePresence } from "framer-motion";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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
  const [voiceText, setVoiceText] = useState("");
  const [searchExcelData, setSearchExcelData] = useState<any[]>([]);
  const [selectedExcelCard, setSelectedExcelCard] = useState<any>(null);

  /* 📜 SEARCH HISTORY */
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
        // Search Businesses
        const res = await axios.get(`${baseURL}/api/user/search`, {
          params: { q: searchText },
        });
        setSearchResults(res.data.businesses || []);

        // Search Excel Data
        const excelRes = await axios.get(`${baseURL}/api/user/excel-data/search`, {
          params: { q: searchText },
        });
        setSearchExcelData(excelRes.data.data || []);

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

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Better for Indian accents

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceText("");
      setIsSearchMode(true);
      setIsSearchFocused(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setVoiceText(finalTranscript || interimTranscript);
      
      if (finalTranscript) {
        setSearchText(finalTranscript);
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone permission denied. Please allow microphone access in browser settings.");
      }
    };
    recognition.onend = () => {
      // Small delay on close to let user see transition
      setTimeout(() => setIsListening(false), 500);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
    }
  };

  // Close recognition if isListening is set to false via UI
  useEffect(() => {
    if (!isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

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
        
        @keyframes pulse-ring {
          0% { transform: scale(.33); }
          80%, 100% { opacity: 0; }
        }
        @keyframes pulse-mic {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .pulse-ring::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #3B82F6;
          animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .goog-dot-container {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .goog-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: goog-dot-anim 1s infinite ease-in-out;
        }
        @keyframes goog-dot-anim {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .goog-dot:nth-child(2) { animation-delay: 0.1s; }
        .goog-dot:nth-child(3) { animation-delay: 0.2s; }
        .goog-dot:nth-child(4) { animation-delay: 0.3s; }
      `}</style>

      {/* Main container sets standard max-widths on larger screens and a full width on mobile.*/}
      <div className="w-full min-h-screen bg-white pb-24 font-sans border-x border-gray-50/50">

        {/* ═══════════════════════════════════════ */}
        {/* 1️⃣ HEADER — Blue Background + Search + Banner */}
        {/* ═══════════════════════════════════════ */}
        <div className="overflow-hidden w-full">
        <div
          className="bg-[#3F87DF] pt-3 pb-12 sm:pb-14 relative"
          style={{ 
            borderBottomLeftRadius: "50% 50px", 
            borderBottomRightRadius: "50% 50px",
            marginLeft: "-20px",
            marginRight: "-20px",
            paddingLeft: "calc(16px + 20px)",
            paddingRight: "calc(16px + 20px)"
          }}
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
                  <img src={logo} alt="Baynana" className="h-[46px] sm:h-[54px] lg:h-[62px] object-contain" />
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
            <div className={`mt-3 sm:mt-4 w-full relative ${isSearchMode && searchText ? 'mb-10 sm:mb-12' : ''}`} ref={searchContainerRef}>
              <div className="flex items-center bg-white rounded-[5px] h-[48px] sm:h-[50px] lg:h-[56px] border border-gray-200/80 overflow-hidden">
                <div className="pl-4 pr-2 flex items-center h-full">
                  <FiSearch className="text-gray-500 lg:w-6 lg:h-6" size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Search Businesses"
                  className="flex-1 h-full py-2 text-gray-800 bg-transparent outline-none border-none placeholder-gray-400 font-normal text-[15px] sm:text-[16px] lg:text-[17px]"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setIsSearchMode(true);
                  }}
                />
                <div className="flex items-center h-full pr-2">
                  {searchText && (
                    <button onClick={() => { setSearchText(''); setSearchResults([]); }} className="p-2 text-gray-400 hover:text-gray-600 transition-colors border-none bg-transparent outline-none">
                      <FiX size={18} />
                    </button>
                  )}
                  <button 
                    onClick={handleVoiceSearch} 
                    className="pl-2 pr-3 flex items-center justify-center h-full border-none bg-transparent outline-none cursor-pointer"
                  >
                    <FiMic className={`${isListening ? 'text-red-500 animate-pulse' : 'text-gray-700'} transition-colors lg:w-6 lg:h-6`} size={22} />
                  </button>
                </div>
              </div>

              {/* 📜 SEARCH HISTORY DROPDOWN - Hidden in Search Mode because it shows in body */}
              {isSearchFocused && !isSearchMode && !searchText && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl z-50 max-h-[320px] overflow-y-auto">
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
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm aspect-[16/7] sm:aspect-[21/9] md:aspect-[3/1] lg:aspect-[4/1] flex flex-col items-center justify-center">
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Paid Promotional Content Here</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className={`w-[6px] h-[6px] rounded-full ${i === 0 ? 'bg-[#4285F4]' : 'bg-gray-300'}`}></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
        </div>

        {/* EXCEL DATA CAROUSEL IN SEARCH */}
        {searchText && !loading && searchExcelData.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 -mt-10 sm:-mt-12 relative z-10 mb-4">
            <div className="w-full">
              <style>{`
                .slick-dots li button:before {
                  font-size: 8px;
                  color: rgba(255, 255, 255, 0.7);
                }
                .slick-dots li.slick-active button:before {
                  color: #3F87DF;
                }
                .slick-dots {
                  bottom: -20px;
                }
              `}</style>
              <Slider 
                dots={true}
                infinite={searchExcelData.length > 1}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                autoplay={searchExcelData.length > 1}
                autoplaySpeed={4000}
                arrows={false}
              >
                {searchExcelData.map((item) => (
                  <div key={item._id} className="outline-none px-1">
                    <div 
                      onClick={() => setSelectedExcelCard(item)}
                      className="w-full bg-white border border-blue-100 p-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <h3 className="font-bold text-[#3F87DF] text-sm sm:text-base mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* MAIN BODY                               */}
        {/* ═══════════════════════════════════════ */}
        {isSearchMode && !searchText ? (
          <div className="max-w-7xl mx-auto px-4 mt-8">
            {/* 🕰️ RECENT SEARCHES */}
            {searchHistory.length > 0 && (
              <div className="mb-8 pt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[14px] sm:text-[15px] font-[700] text-[#333333] tracking-wide">
                    Recent Searches
                  </h3>
                  <button onClick={clearSearchHistory} className="text-[12px] font-[600] text-red-500 hover:text-red-600 transition-colors">
                    Clear All
                  </button>
                </div>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => setSearchText(item)}
                    >
                      <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] bg-[#3c3c3c] rounded-[8px] flex items-center justify-center shrink-0">
                        <FiSearch size={20} className="text-white" />
                      </div>
                      <span className="text-[#333333] font-[500] text-[14px] sm:text-[15px] tracking-wide flex-1 truncate">{item}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromSearchHistory(item);
                        }}
                        className="text-gray-300 hover:text-red-500 pr-1 transition-colors"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 📈 TRENDING SEARCHES */}
            <div className="mb-8 border-t border-gray-200 pt-6" style={{ fontFamily: "'Inter', sans-serif" }}>
              <h3 className="text-[14px] sm:text-[15px] font-[700] text-[#333333] tracking-wide mb-6">
                Trending Searches
              </h3>
              <div className="flex flex-col gap-1.5 sm:gap-2">
                {trendingSearches.map((term, index) => (
                  <div
                    key={index}
                    onClick={() => setSearchText(term)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] bg-[#3c3c3c] rounded-[8px] flex items-center justify-center shrink-0">
                      <FiTrendingUp size={20} className="text-white" />
                    </div>
                    <span className="text-[#333333] font-[500] text-[14px] sm:text-[15px] tracking-wide">{term}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : searchText ? (
          <div className="max-w-7xl mx-auto mt-2">
            {loading && <LoadingSpinner text="Searching..." size={12} />}
            

            {!loading && searchResults.length === 0 && searchExcelData.length === 0 && (
              <div className="text-center py-10 px-4">
                <p className="text-gray-500 font-medium">No results found for "{searchText}"</p>
              </div>
            )}
            <div className="flex flex-col">
              {searchResults.map((biz) => (
                <BusinessListCard key={biz._id} business={biz} />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* 3️⃣ CATEGORY GRID */}
            <div className="px-4 sm:px-8 mt-8">
              <div className="grid grid-cols-5 gap-2 sm:gap-4 md:gap-6 lg:gap-8 justify-items-center max-w-[400px] sm:max-w-none mx-auto">
                {dynamicCategories.slice(0, 9).map((cat, index) => {
                  const color = categoryColors[index % categoryColors.length];
                  return (
                    <div key={cat._id} className="flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer w-full max-w-[76px] sm:max-w-[84px] md:max-w-[100px] group" onClick={() => navigate(`/category/${cat._id}`)}>
                      <div className={`w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] md:w-[76px] md:h-[76px] lg:w-[90px] lg:h-[90px] ${cat.icon ? color.bg : 'bg-gray-50 border border-gray-100'} flex items-center justify-center rounded-xl lg:rounded-2xl group-hover:shadow-md transition-all overflow-hidden`}>
                        {cat.icon ? (
                          <span className={`text-[18px] sm:text-xl md:text-2xl lg:text-4xl ${color.text}`}>{cat.icon}</span>
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
                  <div className="flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer w-full max-w-[76px] sm:max-w-[84px] md:max-w-[100px] group" onClick={() => navigate('/categories')}>
                    <div className="w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] md:w-[76px] md:h-[76px] lg:w-[90px] lg:h-[90px] bg-white border border-gray-100 flex items-center justify-center rounded-xl lg:rounded-2xl group-hover:shadow-md transition-all overflow-hidden">
                      <div className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] md:w-[40px] md:h-[40px] lg:w-[48px] lg:h-[48px] bg-[#4285F4] rounded-full flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors">
                        <FiChevronDown size={20} className="text-white lg:w-7 lg:h-7" />
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
              <div className="border border-[#abc9fc] rounded-[8px] py-2.5 px-3 sm:py-3 sm:px-4 flex items-center justify-between sm:justify-start sm:gap-6 shadow-sm relative overflow-hidden bg-gradient-to-r from-[#f5f9ff] to-white lg:py-5 lg:px-8 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1.5 sm:gap-2 pl-0.5 sm:pl-1">
                  <h3 className="text-[12px] sm:text-base lg:text-lg font-extrabold text-[#3a3a3a] whitespace-nowrap">List Your Business</h3>
                  <span className="bg-[#fe4b49] text-white text-[9px] sm:text-xs lg:text-sm font-bold px-1.5 sm:px-2 py-0.5 rounded-[4px] shadow-[0_1px_3px_rgba(254,75,73,0.3)]">Free</span>
                </div>
                <button
                  onClick={() => isLoggedIn ? navigate('/user/add-business') : setIsFreeListingPopupOpen(true)}
                  className="bg-[#3F87DF] hover:bg-[#326CB2] text-white text-[11px] sm:text-sm lg:text-base font-bold px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-[6px] active:scale-95 transition-transform ml-auto shadow-sm whitespace-nowrap"
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
            <div className="mt-8 mb-10 px-4 sm:px-8 text-center flex flex-col items-center" style={{ fontFamily: "'Inter', sans-serif" }}>
              <h2 className="text-[28px] sm:text-3xl font-[800] text-[#333333] mb-4">Donate to Noor E Iman</h2>

              <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] mb-4">
                <img src="/noor-imaan-1.svg" alt="Noor E Iman Logo" className="w-full h-full object-contain" />
              </div>

              <p className="text-[12px] sm:text-[14px] text-[#333333] font-[600] max-w-[320px] sm:max-w-[400px] mb-6 leading-[1.4]">
                To support baynana and our other work you can<br className="hidden sm:block" /> donate lillah, sadqah and zakat to our<br className="hidden sm:block" /> organisation. <span className="font-[800] border-b-2 border-[#333333] pb-[1px] cursor-pointer">Learn More</span>
              </p>

              <div className="flex items-center gap-4 justify-center">
                <div className="w-[70px] h-[70px] sm:w-[85px] sm:h-[85px] bg-white border-[3px] border-black flex items-center justify-center p-[2px]">
                  {/* Simulated QR Pattern for missing image */}
                  <div className="w-full h-full bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:8px_8px] bg-[position:0_0,4px_4px] opacity-90"></div>
                </div>
                <div className="text-left text-[12px] sm:text-[14px] text-[#333333] font-[600] leading-[1.3] flex flex-col tracking-wide">
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

      {/* 🎤 GOOGLE-STYLE VOICE SEARCH OVERLAY */}
      {isListening && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-all duration-300">
          <button 
            onClick={() => setIsListening(false)}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={28} />
          </button>
          
          <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-lg px-6">
            {/* Real-time transcribed text */}
            <div className="min-h-[120px] w-full text-center">
              <h2 className="text-3xl sm:text-4xl font-normal text-gray-800 leading-tight">
                {voiceText || "Say something..."}
              </h2>
            </div>

            {/* Iconic Google-style bouncing dots */}
            <div className="goog-dot-container">
              <div className="goog-dot bg-[#4285F4]"></div>
              <div className="goog-dot bg-[#EA4335]"></div>
              <div className="goog-dot bg-[#FBBC05]"></div>
              <div className="goog-dot bg-[#34A853]"></div>
            </div>
            
            <div className="relative mt-8">
               <div className="pulse-ring absolute inset-0"></div>
               <div className="relative z-10 w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl">
                 <FiMic size={36} />
               </div>
            </div>

            <p className="text-gray-400 font-medium tracking-wide flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
               Recording...
            </p>
          </div>
        </div>
      )}

      {/* EXCEL DATA MODAL */}
      <AnimatePresence>
        {selectedExcelCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExcelCard(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-[101]"
            >
              <div className="bg-[#3F87DF] p-4 flex justify-between items-start shrink-0">
                <h2 className="text-white font-bold text-base sm:text-lg pr-4">{selectedExcelCard.title}</h2>
                <button onClick={() => setSelectedExcelCard(null)} className="text-white/80 hover:text-white mt-0.5 shrink-0">
                  <FiX size={22} />
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto whitespace-pre-wrap text-gray-700 text-sm sm:text-base leading-relaxed">
                {selectedExcelCard.description}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUPS */}
      {isFreeListingPopupOpen && <FreeListingPopup onClose={() => setIsFreeListingPopupOpen(false)} />}
      {isLoginPopupOpen && <LoginPopup onClose={() => setIsLoginPopupOpen(false)} onLoginSuccess={checkAuth} />}
      {isSignUpPopupOpen && <SignUpPopup onClose={() => setIsSignUpPopupOpen(false)} onSignUpSuccess={checkAuth} />}
    </UserLayout >
  );
}

export default HomePage;
