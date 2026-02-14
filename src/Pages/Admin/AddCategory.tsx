import React, { useState, useEffect } from "react";
import axios from "axios";
import baseURL from "../../config";
import { message } from "antd";
import { FaCloudUploadAlt } from "react-icons/fa";

const AddCategory: React.FC = () => {

    const [name, setName] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Active");
    const [orderPriority, setOrderPriority] = useState(0);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (name) {
            const generatedSlug = name
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");
            setSlug(generatedSlug);
        } else {
            setSlug("");
        }
    }, [name]);

    const handleImageChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!name.trim()) return message.warning("Category name is required");

        const formData = new FormData();
        formData.append("name", name);
        formData.append("slug", slug);
        formData.append("description", description);
        formData.append("status", status);
        formData.append("orderPriority", orderPriority.toString());
        if (image) formData.append("image", image);

        try {
            setLoading(true);
            await axios.post(
                `${baseURL}/api/admin/add-category`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            message.success("Category added successfully");
            setName("");
            setImage(null);
            setPreview(null);
            setSlug("");
            setDescription("");
            setStatus("Active");
            setOrderPriority(0);
        } catch (err) {
            console.error(err);
            message.error("Failed to add category");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 14px',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '14px',
        color: '#0f172a',
        outline: 'none',
        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        background: '#ffffff',
        fontFamily: "'Inter', sans-serif",
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#475569',
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.target.style.borderColor = '#6366f1';
        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.12)';
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeInUp 0.4s ease-out' }}>
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        padding: '24px 28px',
                    }}
                >
                    <h2
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#ffffff',
                            margin: 0,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Add New Category
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '4px 0 0' }}>
                        Create a new category for your businesses
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
                    <div style={{ marginBottom: '18px' }}>
                        <label style={labelStyle}>Category Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter category name"
                            style={inputStyle}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <label style={labelStyle}>Slug (auto-generated)</label>
                        <input
                            type="text"
                            value={slug}
                            readOnly
                            placeholder="Auto-generated slug"
                            style={{
                                ...inputStyle,
                                backgroundColor: '#f8fafc',
                                color: '#94a3b8',
                                cursor: 'default',
                                fontFamily: 'monospace',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <label style={labelStyle}>Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter category description"
                            rows={3}
                            style={{
                                ...inputStyle,
                                resize: 'vertical' as const,
                            }}
                            onFocus={handleFocus as any}
                            onBlur={handleBlur as any}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                style={{
                                    ...inputStyle,
                                    appearance: 'auto' as any,
                                }}
                                onFocus={handleFocus as any}
                                onBlur={handleBlur as any}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Priority Order</label>
                            <input
                                type="number"
                                value={orderPriority}
                                onChange={(e) => setOrderPriority(Number(e.target.value))}
                                placeholder="0"
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>Category Icon</label>
                        <div
                            style={{
                                border: '2px dashed #e2e8f0',
                                borderRadius: '12px',
                                padding: '24px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 250ms',
                                background: preview ? 'transparent' : '#f8fafc',
                            }}
                            onClick={() => document.getElementById('category-image-input')?.click()}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#6366f1';
                                e.currentTarget.style.background = '#eef2ff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.background = preview ? 'transparent' : '#f8fafc';
                            }}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="preview"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '12px',
                                        objectFit: 'cover',
                                        margin: '0 auto',
                                        display: 'block',
                                        border: '1px solid #e2e8f0',
                                    }}
                                />
                            ) : (
                                <>
                                    <FaCloudUploadAlt style={{ fontSize: '28px', color: '#94a3b8', marginBottom: '8px' }} />
                                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                                        Click to upload an image
                                    </p>
                                    <p style={{ color: '#94a3b8', fontSize: '11px', margin: '4px 0 0' }}>
                                        PNG, JPG, SVG up to 2MB
                                    </p>
                                </>
                            )}
                        </div>
                        <input
                            id="category-image-input"
                            type="file"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
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
                            fontFamily: "'Inter', sans-serif",
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
                        {loading ? "Saving..." : "Add Category"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCategory;