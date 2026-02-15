import React, { useEffect, useState } from "react";
import { FiSearch, FiMapPin, FiMic, FiBell } from "react-icons/fi";
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
  const [locationName, setLocationName] = useState("Locating...");

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
      if (userName || userPhone) {
        setCurrentUser({ name: userName || undefined, mobile: userPhone || undefined });
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

  // LOCATION DETECTION
  useEffect(() => {
    if (navigator.geolocation) {
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
    } else {
      setLocationName("Select Location");
    }
  }, []);

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

  return (
    <UserLayout>
      <SidebarMenu open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={currentUser} />

      <div className="w-full min-h-screen bg-gray-50 pb-20 font-sans">

        {/* 🏆 HEADER & HERO SECTION */}
        <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] rounded-b-[2.5rem] shadow-xl pb-16 relative overflow-hidden z-10">
          {/* Background Patterns */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-blue-500 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-purple-500 rounded-full blur-[80px]"></div>
          </div>

          <div className="px-5 pt-6 pb-2 relative z-20">
            {/* Header Top Row */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col text-white">
                <div className="flex items-center gap-1.5 opacity-80 mb-0.5 cursor-pointer hover:opacity-100 transition-opacity">
                  <FiMapPin size={12} className="text-blue-300" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-blue-200">LOCATION</span>
                </div>
                <div className="flex items-center gap-1 group cursor-pointer">
                  <h2 className="text-sm font-bold tracking-wide group-hover:text-blue-200 transition-colors line-clamp-1 max-w-[100px] sm:max-w-[200px]">{locationName}</h2>
                  <svg className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors rotate-0 group-hover:rotate-180 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm">
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1e293b]"></span>
                  <FaBell className="text-white text-sm" />
                </div>

                {/* Auth Button */}
                {!isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsLoginPopupOpen(true)}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-2 py-1.5 sm:px-3 sm:py-2 rounded-full transition-all shadow-lg"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setIsSignUpPopupOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2 py-1.5 sm:px-3 sm:py-2 rounded-full transition-all shadow-lg"
                    >
                      Register
                    </button>
                  </div>
                ) : (
                  <div onClick={() => setSidebarOpen(true)} className="relative cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all border border-white/10 shadow-sm">
                      <FaUserCircle size={24} className="text-white/90 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 leading-tight">
              Find anything in <br />
              <img src={logo} alt="Baynana" className="h-12 mt-2 object-contain" />
            </h1>

            {/* Search Bar */}
            <div className="relative group z-30">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative flex items-center bg-white rounded-2xl shadow-xl h-12 sm:h-14 px-4 transition-transform transform group-hover:scale-[1.01]">
                <FiSearch className="text-gray-400 ml-1" size={20} />
                <input
                  type="text"
                  placeholder="Search for services, shops..."
                  className="w-full h-full px-3 text-gray-700 bg-transparent outline-none placeholder-gray-400 font-medium text-sm sm:text-base"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <div className="pl-3 border-l border-gray-200 h-6 flex items-center cursor-pointer hover:bg-gray-50 rounded-r-xl transition-colors" onClick={handleVoiceSearch}>
                  <FiMic className={`transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500'}`} size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 📦 CONTENT CONTAINER */}
        <div className="px-4 -mt-10 relative z-20 pb-20">

          {/* �️ BANNERS (Moved Up) */}
          {!searchText && (
            <div className="mb-4 rounded-2xl overflow-hidden shadow-md relative z-30 border-2 border-white bg-white">
              <HomeBanner banner={banner} loading={bannerLoading} />
            </div>
          )}

          {/* �📂 CATEGORIES GRID */}
          {!searchText && (
            <div className="bg-white rounded-3xl p-3 shadow-lg border border-gray-100 mb-4 relative z-30">
              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="font-bold text-gray-800 text-lg">Popular Services</h3>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-y-3 gap-x-2">
                {dynamicCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                    onClick={() => navigate(`/category/${cat._id}`)}
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-50 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:bg-blue-50 transition-all border border-gray-100 overflow-hidden relative">
                      {/* Circle Decoration */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {cat.icon ? (
                        <span className="text-2xl text-blue-500 group-hover:scale-110 transition-transform">{cat.icon}</span>
                      ) : (
                        <img
                          src={`${baseURL}/uploads/category/${cat.image}`}
                          alt={cat.name}
                          className="w-8 h-8 sm:w-9 sm:h-9 object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all"
                        />
                      )}
                    </div>
                    {/* FIXED: Text wrapping logic */}
                    <p className="text-[10px] sm:text-[11px] font-medium text-gray-600 text-center leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 h-8 flex items-start justify-center px-1 break-words w-full">
                      {cat.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🏷️ SEARCH RESULTS */}
          {searchText ? (
            <div className="mt-4">
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
              {/* 🖼️ BANNERS - MOVED UP */}

              {/* ⭐ FEATURED / CTA */}
              <div className="bg-[#6366f1] rounded-3xl p-6 text-white text-center shadow-lg shadow-indigo-200 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold mb-2">Grow Your Business</h2>
                  <p className="text-indigo-100 text-sm mb-4">List your business for free and reach millions of customers.</p>
                  <button
                    onClick={() => isLoggedIn ? navigate('/user/add-business') : setIsFreeListingPopupOpen(true)}
                    className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition transform active:scale-95"
                  >
                    List for Free
                  </button>
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
