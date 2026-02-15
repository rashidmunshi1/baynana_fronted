import React from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { Button, Col, Layout, Row } from 'antd';
import { Avatar, Dropdown, Menu } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;

interface NavbarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  disableHoverEffect: () => void;
  style?: React.CSSProperties;
}

// Page title mapping
const pageTitles: Record<string, string> = {
  '/admin/home': 'Dashboard',
  '/admin/user-list': 'Users',
  '/admin/category-list': 'Categories',
  '/admin/categorys/add': 'Add Category',
  '/admin/business-list': 'Businesses',
  '/admin/business-list/add': 'Add Business',
  '/admin/banner': 'Banners',
  '/admin/subcategory-list': 'Sub Categories',
  '/admin/subcategory-add': 'Add Sub Category',
  '/admin/profile': 'My Profile',
};

const Navbar: React.FC<NavbarProps> = ({ collapsed, toggleSidebar, disableHoverEffect, style }) => {
  const userName = localStorage.getItem('user') || '';
  const formattedUserName = userName.replace(/["']/g, '');
  const location = useLocation();

  // Find page title (also handle dynamic routes like /admin/business-list/update/:id)
  let currentTitle = pageTitles[location.pathname] || '';
  if (!currentTitle && location.pathname.startsWith('/admin/business-list/update')) {
    currentTitle = 'Update Business';
  }

  const menu = (
    <Menu
      items={[
        {
          key: "1",
          label: <Link to="/admin/profile">My Profile</Link>,
          icon: <UserOutlined />,
        },
        {
          type: "divider" as const,
        },
        {
          key: "2",
          label: <span style={{ color: "#ef4444", fontWeight: 500 }}>Logout</span>,
          icon: <LogoutOutlined style={{ color: "#ef4444" }} />,
          onClick: () => {
            localStorage.clear();
            window.location.href = "/";
          },
        },
      ]}
    />
  );

  return (
    <Header
      className="header"
      style={{
        ...style,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 20px',
        height: '64px',
        lineHeight: '64px',
      }}
    >
      <Row className="flex items-center" style={{ width: "100%", height: '100%' }}>
        <Col xs={4} sm={4} md={4} xl={4} xxl={4} className="flex items-center">
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '18px', color: '#64748b' }} />}
            onClick={() => {
              toggleSidebar();
              disableHoverEffect();
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="hover:bg-gray-100"
          />
        </Col>

        <Col xs={14} sm={14} md={14} xl={14} xxl={14} className="flex items-center">
          {currentTitle && (
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {currentTitle}
            </h1>
          )}
        </Col>

        <Col xs={6} sm={6} md={6} xl={6} xxl={6} className="flex justify-end items-center">
          <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
            <div
              className="flex items-center cursor-pointer"
              style={{
                padding: '6px 12px 6px 6px',
                borderRadius: '12px',
                transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar
                size={38}
                src="https://i.pravatar.cc/300"
                style={{
                  border: '2px solid #e2e8f0',
                  marginRight: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
              <div className="hidden sm:block">
                <span
                  style={{
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    display: 'block',
                    lineHeight: '1.3',
                  }}
                >
                  {formattedUserName || "Admin"}
                </span>
                <span
                  style={{
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 500,
                    display: 'block',
                    lineHeight: '1.2',
                  }}
                >
                  Administrator
                </span>
              </div>
            </div>
          </Dropdown>
        </Col>
      </Row>
    </Header>
  );
};

export default Navbar;
