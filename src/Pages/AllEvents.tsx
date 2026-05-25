import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import UserLayout from "../DesignLayout/UserLayout";
import baseURL from "../config";
import LoadingSpinner from "../Components/LoadingSpinner";

const AllEvents: React.FC = () => {
  const navigate = useNavigate();
  const [eventBanners, setEventBanners] = useState<any[]>([]);
  const [selectedEventBanner, setSelectedEventBanner] = useState<any>(null);
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
                <div key={eventBanner._id} className="cursor-pointer group" onClick={() => setSelectedEventBanner(eventBanner)}>
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

      {/* EVENT BANNER IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {selectedEventBanner && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEventBanner(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl max-h-[90vh] flex flex-col items-center justify-center z-[111]"
            >
              <button
                onClick={() => setSelectedEventBanner(null)}
                className="absolute -top-10 right-0 sm:-right-10 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/80 p-2 rounded-full"
              >
                <FiX size={24} />
              </button>
              <img
                src={`${baseURL}/${selectedEventBanner.image}`}
                alt={selectedEventBanner.title || "Event Banner"}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </UserLayout>
  );
};

export default AllEvents;
