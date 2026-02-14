import React, { useState } from 'react';
import { Drawer, Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import '../MasterLayout/Master.css';
import { FaListAlt, FaRegUser } from "react-icons/fa";
import { FileTextOutlined, HomeOutlined, UsbOutlined } from "@ant-design/icons";
import { AppstoreOutlined } from "@ant-design/icons";
const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  isSmallScreen: boolean;
  hoverEffectActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onCollapse: (e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element> | boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse, onMouseEnter, onMouseLeave, hoverEffectActive, isSmallScreen }) => {

  const Logo_Main = require('../Assets/new-logo-2.png');
  const location = useLocation();

  const menuItems = [
    { key: '2', icon: <HomeOutlined />, text: 'Dashboard', link: '/admin/home' },
    { key: '3', icon: <FaRegUser />, text: 'Users', link: '/admin/user-list' },
    { key: '4', icon: <AppstoreOutlined />, text: 'Categories', link: '/admin/category-list' },
    { key: '5', icon: <UsbOutlined />, text: 'Businesses', link: '/admin/business-list' },
    { key: '6', icon: <FileTextOutlined />, text: 'Banners', link: '/admin/banner' },
    { key: '7', icon: <FaListAlt />, text: 'Sub Categories', link: '/admin/subcategory-list' },
  ];

  // Determine active key from URL
  const activeKey = menuItems.find(item => location.pathname.startsWith(item.link))?.key || '';

  const collapsedWidth = isSmallScreen ? 0 : 80;

  const FirstStyle = isSmallScreen ? 'mobile-screen-sidebar' : 'desktop-screen-sidebar';
  const SecondStyle = hoverEffectActive && !isSmallScreen ? 'mobile-screen-sidebar' : 'desktop-screen-sidebar';

  const sidebarBg = '#0f172a'; // --sidebar-bg

  const logoSection = (
    <div
      style={{
        top: 0,
        position: 'sticky',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        backgroundColor: sidebarBg,
        height: '64px',
        borderBottom: '1px solid #1e293b',
      }}
    >
      <img
        src={Logo_Main}
        alt="Logo"
        style={{
          maxHeight: collapsed && !isSmallScreen ? '36px' : '42px',
          margin: 'auto',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          filter: 'brightness(1.1)',
        }}
      />
    </div>
  );

  const menuContent = (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[activeKey]}
      style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: sidebarBg,
        color: '#94a3b8',
        border: 'none',
        paddingTop: '8px',
      }}
    >
      {!collapsed && !isSmallScreen && (
        <div
          style={{
            padding: '8px 24px 12px',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: '#475569',
          }}
        >
          Navigation
        </div>
      )}
      {menuItems.map((item) => (
        <Menu.Item
          key={item.key}
          icon={item.icon}
          className="sidebar-menu-active"
          style={{
            background: 'transparent',
            color: '#94a3b8',
            height: '42px',
            lineHeight: '42px',
          }}
        >
          <Link to={item.link} style={{ textDecoration: 'none', color: 'inherit' }}>
            {item.text}
          </Link>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <>
      {isSmallScreen ? (
        <Drawer
          placement="left"
          closable={false}
          onClose={onCollapse}
          width="240px"
          open={collapsed}
          maskClosable
          styles={{ body: { padding: 0 } }}
        >
          {logoSection}
          {menuContent}
        </Drawer>
      ) : (
        <Sider
          style={{
            backgroundColor: sidebarBg,
            borderRight: '1px solid #1e293b',
          }}
          className={`${FirstStyle} ${SecondStyle}`}
          trigger={null}
          collapsible
          collapsed={collapsed}
          collapsedWidth={collapsedWidth}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {logoSection}
          {menuContent}
        </Sider>
      )}
    </>
  );
};

export default Sidebar;
