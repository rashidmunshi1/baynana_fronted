import React, { useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import baseURL from "../../config";

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
                    password: form.password || undefined, // Send undefined if empty so backend doesn't hash empty string
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            message.success("Profile updated successfully");
            setForm({ ...form, password: "" }); // Clear password field
        } catch (error) {
            console.error(error);
            message.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed outline-none"
                        readOnly
                        disabled
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Leave blank to keep current)</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min 6 characters"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all"
                >
                    {loading ? "Updating..." : "Update Profile"}
                </button>
            </form>
        </div>
    );
};

export default AdminProfile;
