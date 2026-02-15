import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Upload, message, Switch, Popconfirm, Image, Tag } from "antd";
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import baseURL from "../../config";

interface BannerType {
    _id: string;
    title: string;
    description: string;
    image: string;
    isActive: boolean;
}

const Banner: React.FC = () => {
    const [banners, setBanners] = useState<BannerType[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerType | null>(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseURL}/api/admin/all-banners`);
            setBanners(response.data);
        } catch (error) {
            console.error("Fetch banners error:", error);
            message.error("Failed to load banners");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingBanner(null);
        setFileList([]);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: BannerType) => {
        setEditingBanner(record);
        setFileList([{
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: `${baseURL}/${record.image}`,
        }]);
        form.setFieldsValue({
            title: record.title,
            description: record.description,
            isActive: record.isActive,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${baseURL}/api/admin/delete-banner/${id}`);
            message.success("Banner deleted successfully");
            fetchBanners();
        } catch (error) {
            console.error("Delete banner error:", error);
            message.error("Failed to delete banner");
        }
    };

    const handleToggleActive = async (id: string, checked: boolean) => {
        try {
            await axios.put(`${baseURL}/api/admin/update-banner/${id}`, { isActive: checked });
            message.success(`Banner ${checked ? "activated" : "deactivated"}`);
            fetchBanners();
        } catch (error) {
            console.error("Toggle active error:", error);
            message.error("Failed to update status");
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description || "");
            formData.append("isActive", values.isActive !== undefined ? values.isActive : true);

            const currentFile = fileList[0];

            if (currentFile && !currentFile.url) {
                formData.append("image", currentFile.originFileObj || currentFile);
            } else if (!editingBanner) {
                return message.error("Please upload an image");
            }

            if (editingBanner) {
                await axios.put(`${baseURL}/api/admin/update-banner/${editingBanner._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                message.success("Banner updated successfully");
            } else {
                await axios.post(`${baseURL}/api/admin/add-banner`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                message.success("Banner created successfully");
            }

            setIsModalOpen(false);
            fetchBanners();
        } catch (error) {
            console.error("Save banner error:", error);
            message.error("Failed to save banner");
        }
    };

    const columns = [
        {
            title: "Image",
            dataIndex: "image",
            key: "image",
            render: (image: string) => (
                <Image
                    width={80}
                    height={48}
                    src={`${baseURL}/${image}`}
                    alt="banner"
                    style={{ borderRadius: "10px", objectFit: "cover" }}
                />
            ),
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text: string) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{text}</span>,
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (text: string) => <span style={{ color: '#64748b' }}>{text}</span>,
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive: boolean, record: BannerType) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Switch
                        checked={isActive}
                        onChange={(checked) => handleToggleActive(record._id, checked)}
                        size="small"
                    />
                    <Tag
                        style={{
                            background: isActive ? '#ecfdf5' : '#fef2f2',
                            color: isActive ? '#059669' : '#dc2626',
                            fontWeight: 600,
                            fontSize: '11px',
                        }}
                    >
                        {isActive ? 'Active' : 'Inactive'}
                    </Tag>
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: BannerType) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        style={{
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            color: '#6366f1',
                        }}
                    />
                    <Popconfirm
                        title="Are you sure to delete this banner?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{
                            style: {
                                backgroundColor: '#ef4444',
                                color: 'white',
                                borderColor: '#ef4444',
                                borderRadius: '6px',
                            }
                        }}
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            style={{ borderRadius: '8px' }}
                        />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const uploadProps = {
        onRemove: (file: any) => { setFileList([]); },
        beforeUpload: (file: any) => { setFileList([file]); return false; },
        fileList,
    };

    return (
        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                    {banners.length} banners configured
                </p>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        height: '44px',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                    }}
                >
                    Add Banner
                </Button>
            </div>

            {/* Table */}
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
            >
                <Table
                    columns={columns}
                    dataSource={banners}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>

            {/* Add/Edit Modal */}
            <Modal
                title={editingBanner ? "Edit Banner" : "Add New Banner"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                okButtonProps={{
                    style: {
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                    }
                }}
                cancelButtonProps={{ style: { borderRadius: '8px' } }}
            >
                <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: "Please enter title" }]}
                    >
                        <Input placeholder="Enter banner title" style={{ borderRadius: '8px', height: '42px' }} />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} placeholder="Enter banner description (optional)" style={{ borderRadius: '8px' }} />
                    </Form.Item>

                    <Form.Item label="Banner Image" required>
                        <Upload {...uploadProps} listType="picture" maxCount={1}>
                            <Button icon={<UploadOutlined />} style={{ borderRadius: '8px' }}>Select Image</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item name="isActive" label="Active Status" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Banner;
