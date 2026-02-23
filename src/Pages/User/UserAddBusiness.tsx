import { useEffect, useState } from "react";
import { Form, Input, Button, Select, Upload, Card, message, Row, Col, Checkbox } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import {
    ShopOutlined,
    EnvironmentOutlined,
    FileImageOutlined,
    ToolOutlined,
    CheckCircleOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    PlusOutlined,
    DeleteOutlined,
    AimOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import UserLayout from "../../DesignLayout/UserLayout";
import baseURL from "../../config";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const stepItems = [
    { title: "Business", icon: <ShopOutlined /> },
    { title: "Location", icon: <EnvironmentOutlined /> },
    { title: "Description", icon: <FileImageOutlined /> },
    { title: "Services", icon: <ToolOutlined /> },
];

/* ─── Shared Styles ─── */
const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e8edf3",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    overflow: "hidden",
};
const inputStyle: React.CSSProperties = { height: 46, borderRadius: 10, fontSize: 14 };
const textareaStyle: React.CSSProperties = { borderRadius: 10, fontSize: 14 };
const sectionTitleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 6px",
};
const sectionSubStyle: React.CSSProperties = {
    fontSize: 13,
    color: "#94a3b8",
    margin: "0 0 24px",
};

const UserAddBusiness = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            message.error("Please login first to add a business");
            navigate("/");
            return;
        }
        axios
            .get(`${baseURL}/api/admin/all-subcategory`)
            .then((res) => setSubcategories(res.data))
            .catch(() => message.error("Failed to load subcategories"));
    }, []);

    /* ─── Step Validation Fields ─── */
    const stepFields: string[][] = [
        // Step 1: Business Details
        ["businessName", "ownerName", "mobile", "subcategories"],
        // Step 2: Location Details
        ["city", "pincode", "address"],
        // Step 3: Description & Images (optional fields — no required validation here)
        [],
        // Step 4: Service & Timing (optional)
        [],
    ];

    const nextStep = async () => {
        const fieldsToValidate = stepFields[currentStep];
        if (fieldsToValidate && fieldsToValidate.length > 0) {
            try {
                await form.validateFields(fieldsToValidate);
            } catch (error) {
                message.warning("Please fill all required fields before proceeding.");
                return;
            }
        }
        setCurrentStep((prev) => Math.min(prev + 1, 3));
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    /* ─── Submit ─── */
    const onFinish = async (values: any) => {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        if (!userId) {
            message.error("User session invalid. Please login again.");
            setLoading(false);
            return;
        }

        let derivedCategoryId = null;
        let selectedSubIds = values.subcategories || [];
        if (!Array.isArray(selectedSubIds)) selectedSubIds = [selectedSubIds];

        if (selectedSubIds.length > 0) {
            const firstSubId = selectedSubIds[0];
            const selectedSubObj = subcategories.find((s) => s._id === firstSubId);
            console.log("Selected subcategory object:", selectedSubObj);
            if (selectedSubObj && selectedSubObj.parentCategory) {
                if (typeof selectedSubObj.parentCategory === "object") {
                    derivedCategoryId = selectedSubObj.parentCategory._id;
                } else {
                    derivedCategoryId = selectedSubObj.parentCategory;
                }
            }
        }
        if (!derivedCategoryId) {
            message.error("Please select a subcategory to determine the main category.");
            setLoading(false);
            return;
        }

        const timings: any = {};
        days.forEach((day) => {
            const val = values[day];
            timings[day] = { open: val?.open || null, close: val?.close || null, closed: val?.closed || false };
        });

        const formData = new FormData();
        formData.append("businessName", values.businessName);
        formData.append("ownerName", values.ownerName);
        formData.append("mobile", values.mobile);
        formData.append("city", values.city);
        formData.append("pincode", values.pincode);
        formData.append("address", values.address);
        formData.append("locationUrl", values.locationUrl || "");
        if (values.latitude) formData.append("latitude", values.latitude);
        if (values.longitude) formData.append("longitude", values.longitude);
        formData.append("description", values.description || "");
        formData.append("category", derivedCategoryId);
        selectedSubIds.forEach((id: string) => formData.append("subcategories", id));
        (values.services || []).forEach((service: string) => formData.append("services", service));
        formData.append("timings", JSON.stringify(timings));
        formData.append("userId", userId);
        fileList.forEach((file) => {
            if (file.originFileObj) formData.append("images", file.originFileObj as File);
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

    /* ════════════════════════════════════════════════
       STEP CONTENT RENDERERS
    ════════════════════════════════════════════════ */

    const renderStep1 = () => (
        <div style={{ animation: "fadeSlideIn 0.35s ease-out" }}>
            <p style={sectionTitleStyle}>🧾 Business Details</p>
            <p style={sectionSubStyle}>Enter your business and owner information</p>

            <Row gutter={16}>
                <Col span={24} md={12}>
                    <Form.Item label="Business Name" name="businessName" rules={[{ required: true, message: "Business name is required" }]}>
                        <Input style={inputStyle} placeholder="e.g. Star Electronics" />
                    </Form.Item>
                </Col>
                <Col span={24} md={12}>
                    <Form.Item label="Owner Name" name="ownerName" rules={[{ required: true, message: "Owner name is required" }]}>
                        <Input style={inputStyle} placeholder="e.g. Rashid Munshi" />
                    </Form.Item>
                </Col>
                <Col span={24} md={12}>
                    <Form.Item label="Mobile Number" name="mobile" rules={[{ required: true, message: "Mobile is required" }]}>
                        <Input style={inputStyle} placeholder="e.g. 9876543210" />
                    </Form.Item>
                </Col>
                <Col span={24} md={12}>
                    <Form.Item label="Category" name="subcategories" rules={[{ required: true, message: "Select at least one category" }]}>
                        <Select
                            mode="multiple"
                            size="large"
                            placeholder="Select Categories"
                            style={{ borderRadius: 10 }}
                            options={subcategories.map((s) => ({ label: s.name, value: s._id }))}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            message.error("Geolocation is not supported by your browser");
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                form.setFieldsValue({
                    latitude: latitude,
                    longitude: longitude,
                    locationUrl: mapUrl,
                });
                setLocationLoading(false);
                message.success("Location captured successfully!");
            },
            (error) => {
                setLocationLoading(false);
                message.error("Failed to get location. Please allow location access.");
                console.error(error);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const renderStep2 = () => {
        const lat = form.getFieldValue("latitude");
        const lng = form.getFieldValue("longitude");
        const locationUrl = form.getFieldValue("locationUrl");
        const hasCoords = lat && lng;

        return (
            <div style={{ animation: "fadeSlideIn 0.35s ease-out" }}>
                <p style={sectionTitleStyle}>📍 Location Details</p>
                <p style={sectionSubStyle}>Help customers find your business</p>

                <Row gutter={16}>
                    <Col span={24} md={12}>
                        <Form.Item label="City" name="city" rules={[{ required: true, message: "City is required" }]}>
                            <Input style={inputStyle} placeholder="e.g. Mumbai" />
                        </Form.Item>
                    </Col>
                    <Col span={24} md={12}>
                        <Form.Item label="Pincode" name="pincode" rules={[{ required: true, message: "Pincode is required" }]}>
                            <Input style={inputStyle} placeholder="e.g. 400001" />
                        </Form.Item>
                    </Col>

                    {/* Current Location Button */}
                    <Col span={24}>
                        <div
                            style={{
                                background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                                borderRadius: 12,
                                padding: "14px 16px",
                                marginBottom: 16,
                                border: "1px solid #bbf7d0",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                                <div>
                                    <p style={{ fontWeight: 600, color: "#166534", fontSize: 13, margin: 0 }}>📍 Business Location</p>
                                    <p style={{ fontSize: 11, color: "#4ade80", margin: "2px 0 0" }}>
                                        {hasCoords ? `Lat: ${Number(lat).toFixed(5)}, Lng: ${Number(lng).toFixed(5)}` : "Use GPS or paste Google Maps link"}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleUseCurrentLocation}
                                    loading={locationLoading}
                                    icon={locationLoading ? <LoadingOutlined /> : <AimOutlined />}
                                    style={{
                                        background: "linear-gradient(135deg, #10b981, #059669)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 10,
                                        height: 40,
                                        fontWeight: 600,
                                        fontSize: 13,
                                        boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
                                    }}
                                >
                                    Use Current Location
                                </Button>
                            </div>
                        </div>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Google Maps URL" name="locationUrl">
                            <Input style={inputStyle} placeholder="Paste Google Maps link or use button above" />
                        </Form.Item>
                    </Col>

                    {/* Hidden lat/lng fields */}
                    <Form.Item name="latitude" hidden><Input /></Form.Item>
                    <Form.Item name="longitude" hidden><Input /></Form.Item>

                    {/* Map Preview */}
                    {(hasCoords || locationUrl) && (
                        <Col span={24}>
                            <div
                                style={{
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    border: "1px solid #e2e8f0",
                                    marginBottom: 16,
                                }}
                            >
                                <iframe
                                    title="Business Location"
                                    width="100%"
                                    height="200"
                                    style={{ border: 0, display: "block" }}
                                    loading="lazy"
                                    src={
                                        hasCoords
                                            ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
                                            : `https://maps.google.com/maps?q=${encodeURIComponent(locationUrl || "")}&z=15&output=embed`
                                    }
                                />
                            </div>
                        </Col>
                    )}

                    <Col span={24}>
                        <Form.Item label="Full Address" name="address" rules={[{ required: true, message: "Address is required" }]}>
                            <Input.TextArea rows={3} style={textareaStyle} placeholder="Shop No, Street, Area, Landmark..." />
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        );
    };

    const renderStep3 = () => (
        <div style={{ animation: "fadeSlideIn 0.35s ease-out" }}>
            <p style={sectionTitleStyle}>📝 Description & Images</p>
            <p style={sectionSubStyle}>Describe your business and upload photos to attract customers</p>

            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item label="Business Description" name="description">
                        <Input.TextArea rows={5} style={textareaStyle} placeholder="Tell customers what makes your business special..." />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item label="Business Images">
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
                                return false;
                            }}
                            onRemove={(file) => {
                                setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
                            }}
                        >
                            {fileList.length >= 10 ? null : (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                    <PlusOutlined style={{ fontSize: 20, color: "#8b5cf6" }} />
                                    <span style={{ fontSize: 12, color: "#64748b" }}>Upload</span>
                                </div>
                            )}
                        </Upload>
                        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>You can upload up to 10 images (JPG, PNG)</p>
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );

    const renderStep4 = () => (
        <div style={{ animation: "fadeSlideIn 0.35s ease-out" }}>
            <p style={sectionTitleStyle}>🔧 Services & Timing</p>
            <p style={sectionSubStyle}>List your services and set your weekly schedule</p>

            {/* Services */}
            <div
                style={{
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: "16px 20px",
                    marginBottom: 24,
                    border: "1px solid #e2e8f0",
                }}
            >
                <p style={{ fontWeight: 600, color: "#334155", fontSize: 14, margin: "0 0 12px" }}>Services Offered</p>
                <Form.List name="services">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field) => (
                                <Row key={field.key} gutter={10} style={{ marginBottom: 8 }}>
                                    <Col flex="auto">
                                        <Form.Item {...field} noStyle>
                                            <Input style={inputStyle} placeholder="e.g. AC Repair, Plumbing" />
                                        </Form.Item>
                                    </Col>
                                    <Col>
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => remove(field.name)}
                                            style={{ height: 46, borderRadius: 10, width: 46 }}
                                        />
                                    </Col>
                                </Row>
                            ))}
                            <Button
                                type="dashed"
                                block
                                onClick={() => add()}
                                icon={<PlusOutlined />}
                                style={{
                                    borderRadius: 10,
                                    height: 44,
                                    marginTop: 4,
                                    color: "#7c3aed",
                                    borderColor: "#c4b5fd",
                                }}
                            >
                                Add Service
                            </Button>
                        </>
                    )}
                </Form.List>
            </div>

            {/* Timings */}
            <div
                style={{
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: "16px 14px",
                    border: "1px solid #e2e8f0",
                }}
            >
                <p style={{ fontWeight: 600, color: "#334155", fontSize: 14, margin: "0 0 4px" }}>Weekly Timings</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 12px" }}>Set Monday timing — it will auto-apply to all days</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {days.map((day) => (
                        <div
                            key={day}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 10,
                                background: day === "monday" ? "#f0e6ff" : "#fff",
                                border: day === "monday" ? "1.5px solid #c4b5fd" : "1px solid #f1f5f9",
                            }}
                        >
                            {/* Row 1: Day name + Closed checkbox */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <span
                                    style={{
                                        textTransform: "capitalize",
                                        fontWeight: 600,
                                        color: day === "monday" ? "#7c3aed" : "#475569",
                                        fontSize: 13,
                                    }}
                                >
                                    {day} {day === "monday" && <span style={{ fontSize: 10, fontWeight: 400 }}>(Master)</span>}
                                </span>
                                <Form.Item name={[day, "closed"]} valuePropName="checked" noStyle>
                                    <Checkbox>
                                        <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 500 }}>Closed</span>
                                    </Checkbox>
                                </Form.Item>
                            </div>
                            {/* Row 2: Time inputs */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Form.Item name={[day, "open"]} noStyle>
                                    <Input type="time" style={{ borderRadius: 8, height: 36, flex: 1, fontSize: 13 }} />
                                </Form.Item>
                                <span style={{ color: "#94a3b8", fontSize: 12 }}>to</span>
                                <Form.Item name={[day, "close"]} noStyle>
                                    <Input type="time" style={{ borderRadius: 8, height: 36, flex: 1, fontSize: 13 }} />
                                </Form.Item>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4];

    /* ════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════ */
    return (
        <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
            <UserLayout>
                {/* ── Header ── */}
                <div className="flex items-center gap-2 mb-5">
                    <IoChevronBack size={24} className="cursor-pointer" onClick={() => navigate(-1)} />
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Add Your Business</h2>
                </div>

                {/* ── Custom Mobile-Friendly Stepper ── */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #e0e7ff 100%)",
                        borderRadius: 16,
                        padding: "16px 12px 14px",
                        marginBottom: 20,
                        border: "1px solid #ddd6fe",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
                        {stepItems.map((item, idx) => {
                            const isActive = idx === currentStep;
                            const isDone = idx < currentStep;
                            return (
                                <div key={idx} style={{ display: "flex", alignItems: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 54 }}>
                                        <div
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 16,
                                                fontWeight: 700,
                                                background: isDone
                                                    ? "linear-gradient(135deg, #10b981, #059669)"
                                                    : isActive
                                                        ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                                                        : "#e2e8f0",
                                                color: isDone || isActive ? "#fff" : "#94a3b8",
                                                transition: "all 0.3s ease",
                                                boxShadow: isActive ? "0 3px 10px rgba(124,58,237,0.35)" : "none",
                                            }}
                                        >
                                            {isDone ? <CheckCircleOutlined style={{ fontSize: 18 }} /> : item.icon}
                                        </div>
                                        <span
                                            style={{
                                                fontSize: 10,
                                                fontWeight: isActive ? 700 : 500,
                                                color: isActive ? "#7c3aed" : isDone ? "#059669" : "#94a3b8",
                                                marginTop: 4,
                                                textAlign: "center",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {item.title}
                                        </span>
                                    </div>
                                    {idx < stepItems.length - 1 && (
                                        <div
                                            style={{
                                                width: 28,
                                                height: 3,
                                                borderRadius: 2,
                                                background: idx < currentStep ? "#10b981" : "#d4d4d8",
                                                margin: "0 2px",
                                                marginBottom: 18,
                                                transition: "background 0.3s ease",
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Step Content ── */}
                <Card bordered={false} style={cardStyle} bodyStyle={{ padding: "28px 24px 20px" }}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        onValuesChange={(changedValues, allValues) => {
                            if (changedValues.monday) {
                                const { open, close, closed } = changedValues.monday;
                                const updates: any = {};
                                days.forEach((day) => {
                                    if (day !== "monday") {
                                        updates[day] = { ...allValues[day] };
                                        if (open !== undefined) updates[day].open = open;
                                        if (close !== undefined) updates[day].close = close;
                                        if (closed !== undefined) updates[day].closed = closed;
                                    }
                                });
                                form.setFieldsValue(updates);
                            }
                        }}
                        initialValues={{
                            ownerName: localStorage.getItem("userName"),
                            mobile: localStorage.getItem("userPhone"),
                        }}
                    >
                        {/* Render All Steps but visually hide inactive ones so form state isn't lost */}
                        <div style={{ display: currentStep === 0 ? "block" : "none" }}>{renderStep1()}</div>
                        <div style={{ display: currentStep === 1 ? "block" : "none" }}>{renderStep2()}</div>
                        <div style={{ display: currentStep === 2 ? "block" : "none" }}>{renderStep3()}</div>
                        <div style={{ display: currentStep === 3 ? "block" : "none" }}>{renderStep4()}</div>
                    </Form>

                    {/* ── Navigation Buttons (OUTSIDE Form to prevent accidental submit) ── */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 28,
                            paddingTop: 20,
                            borderTop: "1px solid #f1f5f9",
                            gap: 12,
                        }}
                    >
                        {/* Left: Back */}
                        {currentStep > 0 ? (
                            <Button
                                size="large"
                                onClick={prevStep}
                                icon={<ArrowLeftOutlined />}
                                style={{
                                    borderRadius: 10,
                                    height: 48,
                                    fontWeight: 600,
                                    border: "1px solid #e2e8f0",
                                    color: "#64748b",
                                    paddingInline: 24,
                                }}
                            >
                                Back
                            </Button>
                        ) : (
                            <div />
                        )}

                        {/* Right: Next or Submit */}
                        {currentStep < 3 ? (
                            <Button
                                size="large"
                                onClick={nextStep}
                                style={{
                                    background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                                    color: "#fff",
                                    borderRadius: 10,
                                    height: 48,
                                    fontWeight: 600,
                                    border: "none",
                                    paddingInline: 32,
                                    boxShadow: "0 3px 12px rgba(124, 58, 237, 0.3)",
                                }}
                            >
                                Next Step <ArrowRightOutlined style={{ marginLeft: 6 }} />
                            </Button>
                        ) : (
                            <Button
                                size="large"
                                onClick={() => form.submit()}
                                loading={loading}
                                icon={<CheckCircleOutlined />}
                                style={{
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "#fff",
                                    borderRadius: 10,
                                    height: 48,
                                    fontWeight: 700,
                                    border: "none",
                                    paddingInline: 36,
                                    boxShadow: "0 3px 12px rgba(16, 185, 129, 0.35)",
                                    fontSize: 15,
                                }}
                            >
                                Submit Application
                            </Button>
                        )}
                    </div>
                </Card>

                {/* ── Inline animation keyframe + mobile styles ── */}
                <style>{`
                    @keyframes fadeSlideIn {
                        from { opacity: 0; transform: translateY(12px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @media (max-width: 576px) {
                        .ant-card-body {
                            padding: 16px 12px 14px !important;
                        }
                        .ant-form-item {
                            margin-bottom: 12px !important;
                        }
                    }
                `}</style>
            </UserLayout>
        </div>
    );
};

export default UserAddBusiness;