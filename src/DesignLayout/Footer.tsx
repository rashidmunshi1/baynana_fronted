import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const FooterEnd: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {

    return (
        <Footer
            style={{
                textAlign: 'center',
                ...style,
                background: 'transparent',
                color: '#94a3b8',
                fontSize: '12.5px',
                fontWeight: 500,
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                letterSpacing: '0.01em',
            }}
        >
            ©{new Date().getFullYear()} <span style={{ color: '#6366f1', fontWeight: 600 }}>Baynana</span>. All Rights Reserved.
        </Footer>
    );
};

export default FooterEnd;
