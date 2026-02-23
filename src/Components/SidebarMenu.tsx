import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaRegEdit, FaBriefcase, FaEnvelope, FaMedal, FaHeadset, FaStore, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import baseURL from "../config";

interface User {
  id?: string;
  name?: string;
  mobile?: string;
  profileImage?: string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const SidebarMenu: React.FC<SidebarProps> = ({ open, onClose, user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userId');
    localStorage.removeItem('profileImage');
    onClose();
    window.location.reload();
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: open ? 0 : "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed right-0 top-0 w-[90%] sm:w-[400px] h-full bg-white z-50 shadow-xl overflow-y-auto p-3"
      >
        {/* Close Button */}
        <div className="text-3xl cursor-pointer mb-2 text-right" onClick={onClose}>✖</div>

        {/* User Info */}
        {/* User Info */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
              {user.profileImage ? (
                <img src={`${baseURL}/${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle size={40} className="text-gray-400" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {user.name || "User"}
                <FaRegEdit className="text-gray-500 cursor-pointer" onClick={() => navigate("/user/profile")} />
              </h2>
              <p className="text-gray-500">{user.mobile || ""}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 font-medium">Welcome Guest</p>
            <button
              onClick={() => { onClose(); /* Trigger login popup from parent if possible, or navigate */ }}
              className="bg-[#7C3AED] text-white px-6 py-2 rounded-full font-semibold text-sm w-full"
            >
              Login / Sign Up
            </button>
          </div>
        )}

        {/* Menu Items */}
        <div className="bg-white shadow rounded-lg p-4 mt-6 grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer"
            onClick={() => navigate("/user/my-businesses")}>
            <FaBriefcase className="text-xl" />
            <p className="font-medium">My Business</p>
          </div>
          <div
            className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer text-red-500"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="text-xl" />
            <p className="font-medium">Logout</p>
          </div>
        </div>

        {/* Add New Business */}
        <div className="flex items-center justify-between p-3 mt-3 border-b cursor-pointer"
          onClick={() => navigate("/user/add-business")} >
          <div className="flex items-center gap-3">
            <FaStore className="text-xl" />
            <span className="font-medium">Add New Business</span>
          </div>

          <span className="bg-red-500 text-white px-2 py-1 text-xs rounded-md">
            Free
          </span>
        </div>
      </motion.div>
    </>
  );
};

export default SidebarMenu;
