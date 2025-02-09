import React, { useState } from 'react';
import { Drawer, Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import '../MasterLayout/Master.css';
import { FaListAlt, FaRegUser } from "react-icons/fa";
import { FileTextOutlined, HomeOutlined } from "@ant-design/icons";
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

  const Logo_Main = require('../Assets/logo.png');
  const [activeSubMenuKey, setActiveSubMenuKey] = useState<string | null>(null);
  const [activeMenuItemKey, setActiveMenuItemKey] = useState<string | null>(null);

  const handleClick = (subMenuKey: string, itemKey: string) => {
    setActiveSubMenuKey(subMenuKey);
    setActiveMenuItemKey(itemKey);
    
    // Close the sidebar when a menu item is clicked on small screens
    if (isSmallScreen) {
      onCollapse(false); // Close the sidebar
    }
  };

  const menuItems = [
    { key: '2', icon: <HomeOutlined />, text: 'Home', link: '/' },
    { key: '3', icon: <FaListAlt />, text: 'Product', link: '/products' },
    { key: '4', icon: <AppstoreOutlined />, text: 'Category', link: '/categorys' },
  ];

  const collapsedWidth = isSmallScreen ? 0 : 80;

  const FirstStyle = isSmallScreen ? 'mobile-screen-sidebar' : 'desktop-screen-sidebar';
  const SecondStyle = hoverEffectActive && !isSmallScreen ? 'mobile-screen-sidebar' : 'desktop-screen-sidebar';

  return (
    <>
      {isSmallScreen ? (
        <Drawer
          placement="left"
          closable={false}
          onClose={onCollapse}
          width="200px"
          open={collapsed}
          maskClosable
        >
          <div style={{
            top: 0,
            position: 'sticky',
            display: 'block',
            textAlign: 'center',
            zIndex: 99,
          }}>
            <img
              src={Logo_Main}
              alt="logo"
              style={{
                maxHeight: '70px',
                margin: 'auto',
              }}
            />
          </div>
          <Menu mode="inline" theme='dark'
            selectedKeys={[activeSubMenuKey, activeMenuItemKey].filter(Boolean) as string[]}
            style={{
              color: 'white',
              minHeight: '100vh',
            }}
          >
            {menuItems.map((item) => (
              <Menu.Item key={item.key} icon={item.icon}
                onClick={() => handleClick('', item.key)}
                className='sidebar-menu-active'
              >
                <Link to={item.link} style={{ textDecoration: 'none' }}>
                  {item.text}
                </Link>
              </Menu.Item>
            ))}
          </Menu>
        </Drawer>
      ) : (
        <Sider
          className={`${FirstStyle} ${SecondStyle}`}
          trigger={null}
          collapsible
          collapsed={collapsed}
          collapsedWidth={collapsedWidth}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div style={{
            top: 0,
            position: 'sticky',
            display: 'block',
            textAlign: 'center',
            zIndex: 999,
            backgroundColor: '#001529',
          }}>
            <img
              src={Logo_Main}
              alt="ImageLogo"
              style={{
                maxHeight: '70px',
                margin: 'auto',
              }}
            />
          </div>
          <Menu mode="inline" theme='dark'
            selectedKeys={[activeSubMenuKey, activeMenuItemKey].filter(Boolean) as string[]}
            style={{
              minHeight: 'calc(100vh - 70px)',
            }}
          >
            {menuItems.map((item) => (
              <Menu.Item key={item.key} icon={item.icon}
                onClick={() => handleClick('', item.key)}
                className='sidebar-menu-active'
              >
                <Link to={item.link} style={{ textDecoration: 'none' }}>
                  {item.text}
                </Link>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
      )}
    </>
  );
};

export default Sidebar;
