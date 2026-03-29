import React, { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserLayout from "../DesignLayout/UserLayout";
import baseURL from "../config";
import LoadingSpinner from "../Components/LoadingSpinner";

const AllEvents: React.FC = () => {
  const navigate = useNavigate();
  const [eventBanners, setEventBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventBanners = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseURL}/api/user/event-banners`);
        setEventBanners(res.data || []);
      } catch (err) {
        console.log("Event Banner fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventBanners();
  }, []);

  return (
    <UserLayout>
      <div className="w-full min-h-screen bg-white pb-24 font-sans">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FiArrowLeft size={18} className="text-gray-700" />
            </button>
            <h1 className="text-[17px] sm:text-lg lg:text-xl font-bold text-gray-800">
              Events & Islamic Gatherings
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
          {loading ? (
            <LoadingSpinner text="Loading events..." size={12} />
          ) : eventBanners.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📅</span>
              </div>
              <p className="text-gray-500 font-medium text-sm">No events found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {eventBanners.map((eventBanner) => (
                <div key={eventBanner._id} className="cursor-pointer group">
                  <div className="w-full aspect-[4/5] bg-[#fdf3f0] rounded-xl overflow-hidden group-hover:shadow-lg transition-all duration-300 border border-gray-100 group-hover:border-gray-200">
                    <img
                      src={`${baseURL}/${eventBanner.image}`}
                      alt={eventBanner.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {eventBanner.title && (
                    <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 font-medium mt-2 line-clamp-2 leading-tight">
                      {eventBanner.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default AllEvents;
