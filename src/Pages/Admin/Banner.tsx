import React, { useState } from "react";
import axios from "axios";
import baseURL from "../../config";

const Banner: React.FC = () => {

    const [title, setTitle] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return alert("Title is required");
        if (!image) return alert("Image is required");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("image", image);
        if (description.trim()) formData.append("description", description);
        formData.append("isActive", isActive.toString());

        try {
            setLoading(true);

            const res = await axios.post(
                `${baseURL}/api/admin/add-banner`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            alert("Banner added successfully");
            setTitle("");
            setImage(null);
            setPreview(null);
            setDescription("");
            setIsActive(true);
        } catch (err) {
            console.error(err);
            alert("Failed to add banner");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: "600px",
                margin: "30px auto",
                background: "#fff",
                padding: "25px",
                borderRadius: "10px",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            }}
        >
            <h2 style={{ marginBottom: "20px", fontWeight: 600 }}>Add New Banner</h2>

            <form onSubmit={handleSubmit}>
                {/* Title */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>
                        Title *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter banner title"
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #d0d0d0",
                            borderRadius: "6px",
                        }}
                        required
                    />
                </div>

                {/* Description */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>
                        Description (optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter banner description"
                        rows={4}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #d0d0d0",
                            borderRadius: "6px",
                            resize: "vertical",
                        }}
                    />
                </div>

                {/* Image */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>
                        Banner Image *
                    </label>
                    <input type="file" accept="image/*" onChange={handleImageChange} required />

                    {preview && (
                        <img
                            src={preview}
                            alt="preview"
                            style={{
                                width: "100px",
                                height: "100px",
                                borderRadius: "6px",
                                marginTop: "10px",
                                objectFit: "cover",
                                border: "1px solid #ddd",
                            }}
                        />
                    )}
                </div>

                {/* Is Active */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        {" "}Active
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "12px 20px",
                        background: "#7C3AED",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        width: "100%",
                    }}
                >
                    {loading ? "Saving..." : "Add Banner"}
                </button>
            </form>
        </div>
    );
};

export default Banner;
