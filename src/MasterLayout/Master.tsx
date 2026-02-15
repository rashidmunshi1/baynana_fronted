import React, { useState, ReactNode, useEffect } from 'react';
import { Layout } from 'antd';
import Navbar from '../DesignLayout/Header';
import FooterEnd from '../DesignLayout/Footer';
import Sidebar from '../DesignLayout/Sidebar';

const { Content } = Layout;

interface MasterProps {
    children: ReactNode;
}

const Master: React.FC<MasterProps> = ({ children }) => {

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

                    <Content
                        style={{
                            margin: '24px',
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
