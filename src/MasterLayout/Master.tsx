import React, { useState, ReactNode, useEffect } from 'react';
import { Layout } from 'antd';
import Navbar from '../DesignLayout/Header';
import FooterEnd from '../DesignLayout/Footer';
import Sidebar from '../DesignLayout/Sidebar';
import { Link, useLocation } from 'react-router-dom';
import { FaListAlt, FaRegUser, FaFileExcel } from "react-icons/fa";
import { FileTextOutlined, HomeOutlined, UsbOutlined, VideoCameraOutlined, AppstoreOutlined } from "@ant-design/icons";

const { Content } = Layout;

interface MasterProps {
    children: ReactNode;
}

const menuItems = [
  { key: '2', icon: <HomeOutlined className="admin-icon" />, text: 'Dashboard', link: '/admin/home' },
  { key: '3', icon: <FaRegUser className="admin-icon" />, text: 'Users', link: '/admin/user-list' },
  { key: '4', icon: <AppstoreOutlined className="admin-icon" />, text: 'Categories', link: '/admin/category-list' },
  { key: '5', icon: <UsbOutlined className="admin-icon" />, text: 'Businesses', link: '/admin/business-list' },
  { key: '6', icon: <FileTextOutlined className="admin-icon" />, text: 'Banners', link: '/admin/banner' },
  { key: '7', icon: <FaListAlt className="admin-icon" />, text: 'Sub Categories', link: '/admin/subcategory-list' },
  { key: '8', icon: <VideoCameraOutlined className="admin-icon" />, text: 'Islamic Method', link: '/admin/video' },
  { key: '9', icon: <FileTextOutlined className="admin-icon" />, text: 'Event Banners', link: '/admin/event-banner' },
  { key: '10', icon: <FaFileExcel className="admin-icon" />, text: 'Excel Upload', link: '/admin/excel-upload' },
];

const Master: React.FC<MasterProps> = ({ children }) => {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [hover, setHover] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const SecondStyle = !isSmallScreen && hover ? '80px' : '';

    const headerStyle = {
        marginLeft: `${SecondStyle}`,
    };

    const handleResize = () => {
        if (window.innerWidth <= 900) {
            setIsSmallScreen(true);
            setCollapsed(false);
        }
        else {
            setIsSmallScreen(false);
        }
    };

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const handleMouseEnter = () => {
        if (hover) {
            setCollapsed(false);
        }
    };

    const handleMouseLeave = () => {
        if (hover) {
            setCollapsed(true);
        }
    };

    const disableHoverEffect = () => {
        setHover(!hover);
    };

    return (
        <>
            <Layout style={{ minHeight: '100vh' }}>
                <Sidebar
                    collapsed={collapsed}
                    onCollapse={toggleSidebar}
                    hoverEffectActive={hover}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    isSmallScreen={isSmallScreen}
                />
                <Layout
                    style={{
                        ...headerStyle,
                        backgroundColor: '#f1f5f9',
                        transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    <Navbar
                        collapsed={collapsed}
                        toggleSidebar={toggleSidebar}
                        disableHoverEffect={disableHoverEffect}
                        style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%' }}
                    />

                    {isSmallScreen && (
                        <div className="admin-horizontal-scroll">
                            {menuItems.map((item) => {
                                const isActive = location.pathname.startsWith(item.link);
                                return (
                                    <Link
                                        key={item.key}
                                        to={item.link}
                                        className={`admin-scroll-item ${isActive ? 'admin-scroll-item-active' : ''}`}
                                    >
                                        {item.icon}
                                        <span>{item.text}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    <Content
                        style={{
                            margin: isSmallScreen ? '12px' : '24px',
                            overflow: 'auto',
                            animation: 'fadeInUp 0.35s ease-out',
                        }}
                    >
                        {children}
                    </Content>
                    <FooterEnd style={{ position: 'sticky', bottom: 0, zIndex: 1, width: '100%' }} />
                </Layout>
            </Layout>
        </>
    );
};

export default Master;
