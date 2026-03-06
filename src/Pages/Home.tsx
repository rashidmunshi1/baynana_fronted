import React, { useEffect, useState } from "react";
import { FiSearch, FiMapPin, FiMic, FiChevronDown, FiChevronRight, FiPlay, FiBriefcase } from "react-icons/fi";
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
                <div className="hidden sm:flex items-center gap-1 cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-white transition-colors" onClick={requestLocation}>
                  <FiMapPin size={14} />
                  <span className="text-[13px] font-bold tracking-wide">{locationName}</span>
                  <FiChevronDown size={14} />
                </div>
              </div>

              {/* Logo Center */}
              <div className="flex-shrink-0 flex justify-center items-center px-1 sm:px-2">
                <img src={logo} alt="Baynana" className="h-[40px] sm:h-[48px] lg:h-[56px] object-contain" />
              </div>

              {/* Right Profile Icon / Auth Buttons */}
              <div className="flex-1 flex justify-end items-center">
                {!isLoggedIn ? (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setIsLoginPopupOpen(true)}
                      className="text-white text-[10px] sm:text-xs font-bold bg-black/20 hover:bg-black/30 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setIsSignUpPopupOpen(true)}
                      className="text-[#4285F4] text-[10px] sm:text-xs font-bold bg-white hover:bg-gray-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors shadow-sm"
                    >
                      Register
                    </button>
                  </div>
                ) : (
                  <div onClick={() => setSidebarOpen(true)} className="cursor-pointer">
                    <div className="w-[30px] h-[30px] rounded-full bg-black/40 text-white flex items-center justify-center shadow-sm overflow-hidden">
                      {currentUser?.profileImage ? (
                        <img src={`${baseURL}/${currentUser.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <FaUserCircle size={18} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-5 w-full">
              <div className="flex items-center bg-white rounded-[4px] h-[40px] px-3 shadow-sm lg:h-[48px]">
                <FiSearch className="text-gray-600 lg:w-5 lg:h-5" size={16} />
                <input
                  type="text"
                  placeholder="Search Businesses"
                  className="w-full h-full px-2 lg:px-4 text-gray-800 bg-transparent outline-none placeholder-gray-400 font-medium text-[13px] lg:text-base"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <button onClick={handleVoiceSearch} className="pl-2 lg:pl-4 border-l border-gray-100 flex items-center h-full">
                  <FiMic className={`${isListening ? 'text-red-500 animate-pulse' : 'text-gray-600'} transition-colors ml-1 lg:w-5 lg:h-5`} size={16} />
                </button>
              </div>
            </div>

            {/* Banner Block */}
            <div className="mt-4 relative z-0">
              <HomeBanner banner={banner} loading={bannerLoading} />
              {(!banner || banner.length === 0) && !bannerLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl shadow-sm aspect-[16/7] sm:aspect-[21/9] md:aspect-[3/1] lg:aspect-[4/1]">
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium z-10">Paid Promotional Content Here</p>
                </div>
              )}
            </div>


          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* MAIN BODY                               */}
        {/* ═══════════════════════════════════════ */}
        {searchText ? (
          <div className="max-w-7xl mx-auto px-4 mt-6">
            {loading && <p className="text-center text-gray-400 py-10 font-medium">Searching...</p>}
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
                  className="bg-[#4285F4] hover:bg-blue-600 text-white text-[12px] sm:text-sm lg:text-base font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-[6px] active:scale-95 transition-transform ml-auto shadow-sm"
                >
                  Start Now
                </button>
              </div>
            </div>

            {/* 6️⃣ EVENTS & ISLAMIC GATHERINGS */}
            {eventBanners.length > 0 && (
              <div className="mt-10">
                <div className="flex justify-between items-center px-4 sm:px-8 mb-4 cursor-pointer">
                  <h3 className="text-[16px] sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800">Events & Islamic Gatherings</h3>
                  <FiChevronRight size={20} className="text-gray-800 font-bold xl:w-6 xl:h-6" />
                </div>
                <div className="flex overflow-x-auto hide-scrollbar px-4 sm:px-8 gap-4 md:gap-6 lg:gap-8 pb-4 snap-x">
                  {eventBanners.map((eventBanner) => (
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
            <div className="mt-10">
              <div className="flex justify-between items-center px-4 sm:px-8 mb-4 cursor-pointer">
                <h3 className="text-[16px] sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800">Learn Islamic Method of Business</h3>
                <FiChevronRight size={20} className="text-gray-800 font-bold xl:w-6 xl:h-6" />
              </div>
              <div className="flex overflow-x-auto hide-scrollbar px-4 sm:px-8 gap-4 md:gap-6 lg:gap-8 pb-4 snap-x">
                {videos.map((video) => (
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

            {/* 8️⃣ DONATE TO NOOR E IMAN */}
            <div className="mt-14 mb-10 px-4 sm:px-8 text-center flex flex-col items-center">
              <h2 className="text-[22px] sm:text-2xl lg:text-3xl font-extrabold text-[#3a3a3a] mb-5">Donate to Noor E Iman</h2>

              {/* Emblem Placeholder (using CSS structure resembling the logo in screenshot) */}
              <div className="w-[84px] h-[100px] sm:w-[100px] sm:h-[120px] lg:w-[120px] lg:h-[140px] mb-6 lg:mb-8 relative flex flex-col items-center justify-center text-white font-bold pb-2 drop-shadow-sm">
                <div className="absolute inset-0 bg-white border-[3px] border-[#31a3d9] rounded-t-[40px] rounded-b-[10px] transform perspective-[100px] rotateX-0 z-0 after:content-[''] after:absolute after:-bottom-[15px] after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0 after:border-l-[40px] after:border-l-transparent after:border-r-[40px] after:border-r-transparent after:border-t-[20px] after:border-t-[#31a3d9] flex justify-center items-center lg:after:border-l-[50px] lg:after:border-r-[50px] lg:after:border-t-[25px] lg:after:-bottom-[18px]">
                  <div className="w-[85%] h-[85%] border-2 border-[#31a3d9] rounded-t-[30px] rounded-b-[5px] flex items-center justify-center bg-white m-auto">
                    <span className="text-[#31a3d9] font-extrabold text-xl lg:text-2xl leading-tight text-center">નૂરે<br />ઇમાન</span>
                  </div>
                </div>
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
    </UserLayout>
  );
}

export default HomePage;
