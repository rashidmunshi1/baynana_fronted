import React, { useEffect } from "react";
import { FiHome, FiPlus, FiMenu, FiUser, FiSearch } from "react-icons/fi"; // Changed FiPlusSquare to FiPlus
import { useNavigate, useLocation } from "react-router-dom";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: FiHome, label: "Home", path: "/" },

    { icon: FiPlus, label: "Add", path: "/user/add-business" },
    { icon: FiUser, label: "Profile", path: "/user/profile" },

  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/" || location.pathname === "/user/home";
    // For other paths, exact match or startswith
    return location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
  };

  return (
    <div className="relative min-h-screen pb-[60px] bg-gray-50">
      {children}

      {/* 📱 STANDARD BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 shadow-sm safe-area-pb">
        {navItems.map((item, index) => {
          const active = isActive(item.path);

          return (
            <div
              key={index}
              onClick={() => {
                if (item.path.startsWith("/")) navigate(item.path);
              }}
              className="flex flex-col items-center justify-center w-full h-full cursor-pointer active:bg-gray-50 transition-colors"
            >
              <item.icon
                size={24}
                className={`mb-1 transition-colors duration-200 ${active ? 'text-blue-600' : 'text-gray-400'}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <p
                className={`text-[10px] font-medium transition-colors duration-200 ${active ? 'text-blue-600' : 'text-gray-500'}`}
              >
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
