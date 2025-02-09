import React, { useEffect, useState } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { Button, Col, Layout, Row } from 'antd';
import { useLocation } from 'react-router-dom';

const { Header } = Layout;

interface NavbarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  disableHoverEffect: () => void;
}
interface StaticRoute {
    kind: 'static';
    header: string;
  }
  
  interface DynamicRoute {
    kind: 'dynamic';
    header: (params: Record<string, string>) => string;
  }
  
  type RouteHeaderMap = {
    [key: string]: StaticRoute | DynamicRoute;
  };
  
const Navbar: React.FC<NavbarProps> = ({ collapsed, toggleSidebar, disableHoverEffect }) => {
  const userName = localStorage.getItem('user') || ''; 
  const formattedUserName = userName.replace(/["']/g, '');
  const location = useLocation();
  const [headerName, setHeaderName] = useState('');

  const ButtonStyle = {
    marginTop: '18px',
    background: 'transparent',
  };
  
  

  return (
    <Header className='header bg-[#001529]'>
    <Row className="flex items-center">
      <Col xs={6} sm={6} md={6} xl={6} xxl={6}>
        <Button
          type="text"
          icon={<MenuOutlined className='header-icon' />}
          style={ButtonStyle}
          onClick={() => {
            toggleSidebar();
            disableHoverEffect();
          }}
          className='m-2'
        />
      </Col>
      <Col xs={24} sm={24} md={12} xl={12} xxl={12} className="flex justify-center items-center text-center">
  <span className="font-semibold text-lg sm:text-xl md:text-2xl text-white whitespace-nowrap hidden sm:block">
    Welcome Project
  </span>
</Col>


    </Row>
  </Header>
  

  );
};

export default Navbar;
