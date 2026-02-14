import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBuilding, FaListAlt, FaUsers, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import baseURL from "../../config";

const HomePageadmin: React.FC = () => {
  const [businessTotal, setBusinessTotal] = useState<number>(0);
  const [categoryTotal, setCategoryTotal] = useState<number>(0);
  const [userTotal, setUserTotal] = useState<number>(0);

  useEffect(() => {
    fetchTotal();
  }, []);

  const fetchTotal = async () => {
    try {
      const businessRes = await axios.get(`${baseURL}/api/admin/total-business`);
      setBusinessTotal(businessRes.data.total);

      const categoryRes = await axios.get(`${baseURL}/api/admin/total-category`);
      setCategoryTotal(categoryRes.data.total);

      const userRes = await axios.get(`${baseURL}/api/admin/total-users`);
      setUserTotal(userRes.data.total);
    } catch (error) {
      console.log("API error:", error);
    }
  };

  const userName = localStorage.getItem('user') || 'Admin';
  const formattedUserName = userName.replace(/["']/g, '');

  const cards = [
    {
      title: "Total Businesses",
      count: businessTotal,
      icon: <FaBuilding />,
      link: "/admin/business-list",
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      shadowColor: "rgba(99, 102, 241, 0.25)",
      lightBg: "#eef2ff",
      iconColor: "#6366f1",
    },
    {
      title: "Total Categories",
      count: categoryTotal,
      icon: <FaListAlt />,
      link: "/admin/category-list",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      shadowColor: "rgba(16, 185, 129, 0.25)",
      lightBg: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      title: "Total Users",
      count: userTotal,
      icon: <FaUsers />,
      link: "/admin/user-list",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      shadowColor: "rgba(245, 158, 11, 0.25)",
      lightBg: "#fffbeb",
      iconColor: "#f59e0b",
    },
  ];

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Welcome back, {formattedUserName} 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', fontWeight: 400 }}>
          Here's an overview of your platform activity.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 28px ${card.shadowColor}`;
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {/* Decorative gradient bar at top */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: card.gradient,
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p
                    style={{
                      color: '#64748b',
                      fontSize: '13px',
                      fontWeight: 500,
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {card.title}
                  </p>
                  <h2
                    style={{
                      fontSize: '36px',
                      fontWeight: 700,
                      margin: '10px 0 0',
                      color: '#0f172a',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                      animation: 'countUp 0.5s ease-out',
                    }}
                  >
                    {card.count}
                  </h2>
                </div>

                {/* Icon Circle */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: card.lightBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    color: card.iconColor,
                    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {card.icon}
                </div>
              </div>

              {/* View Link */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '18px',
                  color: card.iconColor,
                  fontSize: '12.5px',
                  fontWeight: 600,
                }}
              >
                <span>View Details</span>
                <FaArrowRight style={{ fontSize: '10px' }} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          animation: 'fadeInUp 0.4s ease-out 0.3s both',
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Add Business', link: '/admin/business-list/add', bg: '#eef2ff', color: '#4f46e5' },
            { label: 'Add Category', link: '/admin/categorys/add', bg: '#ecfdf5', color: '#059669' },
            { label: 'Manage Banners', link: '/admin/banner', bg: '#fffbeb', color: '#d97706' },
          ].map((action, i) => (
            <Link key={i} to={action.link} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: action.bg,
                  color: action.color,
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {action.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePageadmin;
