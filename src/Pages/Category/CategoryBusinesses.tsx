
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BusinessListCard from "../../Components/BusinessListCard";
import UserLayout from "../../DesignLayout/UserLayout";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import baseURL from "../../config";

const CategoryBusinesses = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1️⃣ Fetch Subcategories
        const subRes = await axios.get(`${baseURL}/api/admin/subcategory/parent/${id}`);
        setSubcategories(subRes.data.subcategories || []);

        // 2️⃣ Fetch Businesses
        const bizRes = await axios.get(`${baseURL}/api/user/business-by-category/${id}`);
        setBusinesses(bizRes.data.businesses || []);

        // 3️⃣ Get Category Name
        if (bizRes.data.categoryName) {
          setCategoryName(bizRes.data.categoryName);
        } else if (subRes.data.categoryName) {
          setCategoryName(subRes.data.categoryName);
        }

      } catch (err) {
        console.error("Error fetching category data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Filter and Sort businesses
  let filteredBusinesses = selectedSub
    ? businesses.filter((b: any) => b.subcategories && b.subcategories.some((s: any) => s._id === selectedSub))
    : [...businesses];

  // Apply Sorting
  filteredBusinesses = filteredBusinesses.sort((a, b) => {
    if (sortBy === "top_rated") {
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      return bRating - aRating;
    }
    if (sortBy === "a_to_z") {
      return (a.businessName || "").localeCompare(b.businessName || "");
    }
    if (sortBy === "z_to_a") {
      return (b.businessName || "").localeCompare(a.businessName || "");
    }
    // Default: 'newest'
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">

        {/* HEADER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-3 sm:px-4 py-2.5 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
            >
              <FaArrowLeft size={14} />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-[#3F87DF] truncate">
                {categoryName || "Explore Services"}
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500">{businesses.length} results found</p>
            </div>
          </div>

        </motion.div>

        {/* BADGE FILTERS (Horizontally Scrollable) */}
        <div
          className="bg-white px-3 sm:px-4 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto whitespace-nowrap w-full hide-scroll"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`
            .hide-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {[
            { id: 'filter', label: 'Filter' },
            { id: 'sort', label: 'Sort by' },
            { id: 'price', label: 'Price' }
          ].map((badge) => (
            <button
              key={badge.id}
              onClick={() => {
                if (badge.id === 'sort') setShowFilterDropdown(!showFilterDropdown);
              }}
              className={`flex-shrink-0 flex items-center justify-center whitespace-nowrap px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold transition-colors
                ${badge.id === 'sort' && showFilterDropdown ? 'bg-violet-50 text-violet-700 border-violet-300' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {badge.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown Panel */}
        <AnimatePresence>
          {showFilterDropdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-b border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-4 py-2 flex flex-col gap-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sort By</p>
                {[
                  { id: 'newest', label: 'Newest First' },
                  { id: 'top_rated', label: 'Top Rated' },
                  { id: 'a_to_z', label: 'Name (A to Z)' },
                  { id: 'z_to_a', label: 'Name (Z to A)' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowFilterDropdown(false);
                    }}
                    className={`text-left px-3 py-2 text-sm rounded transition-colors ${sortBy === option.id ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUBCATEGORY SCROLL */}
        {subcategories.length > 0 && (
          <div className="sticky top-[52px] sm:top-[64px] z-10 bg-gray-50/95 backdrop-blur-sm py-2 border-b border-gray-200">
            <div className="flex gap-2 px-3 sm:px-4 overflow-x-auto no-scrollbar pb-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSub(null)}
                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all shadow-sm whitespace-nowrap ${!selectedSub
                  ? 'bg-violet-600 text-white shadow-violet-200 ring-2 ring-violet-200 ring-offset-1'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
              >
                All
              </motion.button>
              {subcategories.map((sub) => (
                <motion.button
                  key={sub._id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSub(sub._id)}
                  className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all shadow-sm ${selectedSub === sub._id
                    ? 'bg-violet-600 text-white shadow-violet-200 ring-2 ring-violet-200 ring-offset-1'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  {sub.name}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="w-full">
          {loading ? (
            <div className="space-y-3 pt-4 px-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                  <div className="flex gap-3 p-3">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                  <div className="flex border-t border-gray-100">
                    <div className="flex-1 py-3 border-r border-gray-100"><div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div></div>
                    <div className="flex-1 py-3 border-r border-gray-100"><div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div></div>
                    <div className="flex-1 py-3"><div className="h-3 bg-gray-200 rounded w-14 mx-auto"></div></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div layout className="flex flex-col">
              <AnimatePresence mode='popLayout'>
                {filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map((biz) => (
                    <motion.div
                      layout
                      key={biz._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <BusinessListCard business={biz} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center pt-20 text-center"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4 text-gray-300">
                      🚫
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">No businesses found</h3>
                    <p className="text-gray-500 text-sm mt-1">Try selecting a different subcategory.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

      </div>
    </UserLayout>
  );
};

export default CategoryBusinesses;
