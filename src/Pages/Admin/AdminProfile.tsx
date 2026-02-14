import React, { useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import baseURL from "../../config";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const AdminProfile = () => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${baseURL}/api/admin/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setForm({ ...form, name: res.data.name, email: res.data.email });
        } catch (error) {
            console.error(error);
            message.error("Failed to fetch profile");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${baseURL}/api/admin/profile`,
                {
                    name: form.name,
                    email: form.email,
                    password: form.password || undefined,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            message.success("Profile updated successfully");
            setForm({ ...form, password: "" });
        } catch (error) {
            console.error(error);
            message.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '560px', margin: '0 auto', animation: 'fadeInUp 0.4s ease-out' }}>
            {/* Profile Card */}
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                }}
            >
                {/* Header with gradient */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        padding: '32px 28px 24px',
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            width: '68px',
                            height: '68px',
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '14px',
                            border: '2px solid rgba(255,255,255,0.3)',
                        }}
                    >
                        <FaUser style={{ fontSize: '26px', color: '#ffffff' }} />
                    </div>
                    <h2
                        style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#ffffff',
                            margin: '0 0 4px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Admin Profile
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>
                        Manage your account settings
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#475569',
                                marginBottom: '8px',
                            }}
                        >
                            <FaUser style={{ fontSize: '11px', marginRight: '6px', opacity: 0.6 }} />
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none',
                                transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                                background: '#ffffff',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#6366f1';
                                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.12)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#475569',
                                marginBottom: '8px',
                            }}
                        >
                            <FaEnvelope style={{ fontSize: '11px', marginRight: '6px', opacity: 0.6 }} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            readOnly
                            disabled
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                color: '#94a3b8',
                                background: '#f8fafc',
                                cursor: 'not-allowed',
                                outline: 'none',
                            }}
                        />
                        <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                            Email cannot be changed.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#475569',
                                marginBottom: '8px',
                            }}
                        >
                            <FaLock style={{ fontSize: '11px', marginRight: '6px', opacity: 0.6 }} />
                            New Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current"
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none',
                                transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                                background: '#ffffff',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#6366f1';
                                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.12)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                            Minimum 6 characters required.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '13px',
                            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.35)',
                            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '0.01em',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                                (e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.45)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.transform = 'translateY(0)';
                            (e.target as HTMLElement).style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)';
                        }}
                    >
                        {loading ? "Updating..." : "Update Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminProfile;
