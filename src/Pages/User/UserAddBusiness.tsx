import { useEffect, useState } from "react";
import { Form, Input, Button, Select, Upload, Card, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import UserLayout from "../../DesignLayout/UserLayout";
import baseURL from "../../config";

// Category Type Based on Your API
type Category = {
    _id: string;
    name: string;
    image: string | null;
    parentCategory: {
        _id: string;
        name: string;
    } | null;
};

const UserAddBusiness = () => {
    const navigate = useNavigate();

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [subcategories, setSubcategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch ALL subcategories on mount
        axios
            .get(`${baseURL}/api/admin/all-subcategory`)
            .then((res) => setSubcategories(res.data))
            .catch(() => message.error("Failed to load subcategories"));
    }, []);

    const onFinish = async (values: any) => {
        setLoading(true);

        // Infer Category from the first selected Subcategory
        let derivedCategoryId = null;

        // values.subcategories could be a single ID or array depending on Select mode
        const selectedSubIds = Array.isArray(values.subcategories) ? values.subcategories : [values.subcategories];

        if (selectedSubIds && selectedSubIds.length > 0) {
            const firstSubId = selectedSubIds[0];
            const selectedSubObj = subcategories.find((s) => s._id === firstSubId);
            if (selectedSubObj && selectedSubObj.parentCategory) {
                derivedCategoryId = selectedSubObj.parentCategory._id;
            }
        }

        if (!derivedCategoryId) {
            message.error("Please select a subcategory to determine the main category.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        const userId = localStorage.getItem("userId");
        const storedOwnerName = localStorage.getItem("userName");
        const storedMobile = localStorage.getItem("userPhone");

        if (!storedMobile) {
            message.error("User session invalid. Please login again.");
            setLoading(false);
            return;
        }

        // Basic fields
        formData.append("businessName", values.businessName);
        formData.append("ownerName", storedOwnerName || "Unknown"); // Auto-filled
        formData.append("mobile", storedMobile); // Auto-filled
        formData.append("city", values.city);
        formData.append("pincode", values.pincode);
        formData.append("address", values.address);

        // Add derived category
        formData.append("category", derivedCategoryId);

        // Subcategories
        selectedSubIds.forEach((id: string) => {
            formData.append("subcategories", id);
        });

        // Services array
        (values.services || []).forEach((service: string) => {
            formData.append("services", service);
        });

        // ⭐ ADD USER ID HERE
        formData.append("userId", userId || "");

        // Images
        fileList.forEach((file) => {
            if (file.originFileObj) {
                formData.append("images", file.originFileObj as File);
            }
        });

        try {
            await axios.post(`${baseURL}/api/admin/add-business`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            message.success("Business added successfully!");
            navigate("/user/my-businesses");

        } catch (error) {
            console.error(error);
            message.error("Failed to add business");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-3 sm:p-6">
            <UserLayout>
                <div className="flex items-center gap-2 mb-3">
                    <IoChevronBack
                        size={24}
                        className="cursor-pointer"
                        onClick={() => navigate(-1)}
                    />
                    <h2 className="text-lg font-bold">Add Your Business</h2>
                </div>


                <Form layout="vertical" onFinish={onFinish}>

                    {/* Basic Info */}
                    <Card className="mb-3" size="small" title="Basic Information">
                        <Form.Item label="Business Name" name="businessName" rules={[{ required: true }]}>
                            <Input placeholder="Enter Business Name" />
                        </Form.Item>

                        {/* Owner Name & Mobile are auto-fetched from User Profile (LocalStorage) */}

                        {/* SUB CATEGORY SELECT (Multiple) */}
                        <Form.Item
                            label="Category"
                            name="subcategories"
                            rules={[{ required: true, message: "Please select at least one subcategory" }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Choose Category"
                                options={subcategories.map((item) => ({
                                    label: item.name,
                                    value: item._id,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                            <Input.TextArea rows={2} placeholder="Complete Business Address" />
                        </Form.Item>

                        <Form.Item label="City" name="city" rules={[{ required: true }]}>
                            <Input placeholder="Enter City" />
                        </Form.Item>

                        <Form.Item
                            label="Pincode"
                            name="pincode"
                            rules={[{ required: true, message: "Pincode is required" }]}
                        >
                            <Input placeholder="Enter Pincode" />
                        </Form.Item>



                        {/* IMAGE UPLOAD */}
                        <Form.Item label="Business Logo / Images">
                            <Upload
                                listType="picture-card"
                                multiple
                                fileList={fileList}
                                beforeUpload={(file) => {
                                    const newFile: UploadFile = {
                                        uid: file.uid,
                                        name: file.name,
                                        originFileObj: file,
                                        url: URL.createObjectURL(file as unknown as Blob),
                                    };

                                    setFileList((prev) => [...prev, newFile]);
                                    return false; // stop auto uploading
                                }}
                                onRemove={(file) => {
                                    setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
                                }}
                            >
                                + Upload
                            </Upload>
                        </Form.Item>
                    </Card>

                    {/* Services */}
                    <Card className="mb-3" size="small" title="Services You Provide">
                        <Form.List name="services">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field) => (
                                        <div key={field.key} className="flex gap-2 mb-2">
                                            <Form.Item {...field} className="flex-1">
                                                <Input placeholder="Service name" />
                                            </Form.Item>
                                            <Button danger onClick={() => remove(field.name)}>X</Button>
                                        </div>
                                    ))}
                                    <Button block type="dashed" onClick={() => add()}>
                                        + Add Service
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>

                    <Button
                        htmlType="submit"
                        type="primary"
                        block
                        size="large"
                        loading={loading}
                        style={{ backgroundColor: "#7C3AED", borderRadius: 6 }}
                    >
                        Submit
                    </Button>
                </Form>
            </UserLayout>
        </div>
    );
};

export default UserAddBusiness;