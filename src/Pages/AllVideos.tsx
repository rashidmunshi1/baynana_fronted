import React, { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserLayout from "../DesignLayout/UserLayout";
import baseURL from "../config";
import LoadingSpinner from "../Components/LoadingSpinner";

const AllVideos: React.FC = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseURL}/api/user/videos`);
        setVideos(res.data || []);
      } catch (err) {
        console.log("Video fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
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
              Learn Islamic Method of Business
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
          {loading ? (
            <LoadingSpinner text="Loading videos..." size={12} />
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎥</span>
              </div>
              <p className="text-gray-500 font-medium text-sm">No videos found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {videos.map((video) => (
                <div key={video._id} className="cursor-pointer group">
                  <div className="w-full aspect-[16/9] bg-[#f0ecfc] rounded-xl overflow-hidden group-hover:shadow-lg transition-all duration-300 border border-gray-100 group-hover:border-gray-200">
                    <video
                      src={`${baseURL}/${video.videoPath}`}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 font-medium mt-2.5 leading-snug line-clamp-2">
                    {video.title} {video.description ? `- ${video.description}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default AllVideos;
