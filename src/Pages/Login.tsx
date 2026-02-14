import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import baseURL from "../config";

interface LoginProps {
  setToken: (t: string) => void;
}

const Login: React.FC<LoginProps> = ({ setToken }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}/api/admin/login`, values);

      message.success("Login Successful");

      localStorage.setItem("token", res.data.token);
      if (res.data.user) {
        localStorage.setItem("userId", res.data.user._id);
        localStorage.setItem("user", res.data.user.name);
      } else if (res.data.admin) {
        localStorage.setItem("userId", res.data.admin._id);
        localStorage.setItem("user", res.data.admin.name);
      }

      setToken(res.data.token);
      navigate("/admin/home", { replace: true });
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Background Elements */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          top: '-100px',
          right: '-100px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          bottom: '-80px',
          left: '-80px',
        }}
      />

      <div
        style={{
          width: '420px',
          maxWidth: '90vw',
          animation: 'fadeInUp 0.5s ease-out',
        }}
      >
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src={require('../Assets/logo.png')}
            alt="Baynana Logo"
            style={{
              height: '60px',
              objectFit: 'contain',
              margin: '0 auto 16px',
              display: 'block',
              filter: 'brightness(1.1) drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
            }}
          />
          <h1
            style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: 700,
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Sign in to access the admin panel
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '36px 32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={<span style={{ color: '#cbd5e1', fontWeight: 500, fontSize: '13px' }}>Email Address</span>}
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Enter valid email" },
              ]}
            >
              <Input
                placeholder="admin@baynana.com"
                size="large"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  fontSize: '14px',
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: '#cbd5e1', fontWeight: 500, fontSize: '13px' }}>Password</span>}
              name="password"
              rules={[{ required: true, message: "Please enter password" }]}
              style={{ marginBottom: '28px' }}
            >
              <Input.Password
                placeholder="Enter your password"
                size="large"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  fontSize: '14px',
                }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                fontSize: '15px',
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                letterSpacing: '0.01em',
              }}
            >
              Sign In
            </Button>
          </Form>

          <p
            style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '13px',
              color: '#94a3b8',
            }}
          >
            Forgot Password?{" "}
            <span
              style={{
                color: '#818cf8',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'color 200ms',
              }}
              onClick={() => navigate("/forgot-password")}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#a5b4fc')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#818cf8')}
            >
              Reset Here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;