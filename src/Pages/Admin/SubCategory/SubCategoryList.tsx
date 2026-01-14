import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import baseURL from "../../../config";

interface SubCategory {
    _id: string;
    name: string;
    image?: string;
    parentCategory: {
        name: string;
        _id: string;
    }
    status: string;
    orderPriority: number;
}

const SubCategoryList: React.FC = () => {


    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubCategories = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/admin/all-subcategory`);
            setSubCategories(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubCategories();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
        try {
            await axios.delete(`${baseURL}/api/admin/delete-subcategory/${id}`);
            setSubCategories(subCategories.filter(item => item._id !== id));
            alert("Deleted successfully");
        } catch (error) {
            alert("Failed to delete");
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Sub Categories</h2>
                <Link
                    to="/admin/subcategory-add"
                    style={{
                        backgroundColor: "#7C3AED",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        textDecoration: "none",
                        fontWeight: "bold",
                    }}
                >
                    + Add New Sub Category
                </Link>
            </div>

            <div style={{ overflowX: "auto", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                    <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            <th style={thStyle}>#</th>
                            <th style={thStyle}>Image</th>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Parent Category</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subCategories.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: "20px", textAlign: "center" }}>
                                    No Subcategories found.
                                </td>
                            </tr>
                        ) : (
                            subCategories.map((item, index) => {
                                // Construct full image URL
                                const imageUrl = item.image
                                    ? `${baseURL}/uploads/category/${item.image}`
                                    : null;

                                return (
                                    <tr key={item._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                        <td style={tdStyle}>{index + 1}</td>
                                        <td style={tdStyle}>
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item.name}
                                                    style={{ width: "50px", height: "50px", borderRadius: "4px", objectFit: "cover", border: '1px solid #eee' }}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/50?text=Error";
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ color: "#999", fontSize: '12px' }}>No Img</span>
                                            )}
                                        </td>
                                        <td style={tdStyle}><strong>{item.name}</strong></td>
                                        <td style={tdStyle}>
                                            {item.parentCategory?.name || <span style={{ color: 'red' }}>Deleted Parent</span>}
                                        </td>
                                        <td style={tdStyle}>
                                            <span
                                                style={{
                                                    padding: "4px 8px",
                                                    borderRadius: "12px",
                                                    fontSize: "12px",
                                                    background: item.status === "Active" ? "#dcfce7" : "#fee2e2",
                                                    color: item.status === "Active" ? "#166534" : "#991b1b",
                                                }}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                style={{
                                                    padding: "6px 12px",
                                                    background: "#ef4444",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "12px"
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const thStyle = {
    padding: "15px",
    textAlign: "left" as const,
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
};

const tdStyle = {
    padding: "15px",
    fontSize: "14px",
    color: "#334155",
};

export default SubCategoryList;
