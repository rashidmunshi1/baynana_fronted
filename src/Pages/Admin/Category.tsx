import { Card, Row, Table, Col, Input, message, Spin, Modal, Button, Tag, Form, Upload, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined, EditOutlined, DeleteOutlined, UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";
import baseURL from "../../config";

interface ParentCategory {
  _id: string;
  name: string;
  image: string | null;
}

export interface Category {
  _id: string;
  name: string;
  image: string | null;
  parentCategory: ParentCategory | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  orderPriority: number;
  slug: string;
  description: string;
}

export const CategoryTable = () => {
  const [dataSource, setDataSource] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  const navigate = useNavigate();

  // Fetch API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Category[]>(`${baseURL}/api/admin/all-category`);
      setDataSource(res.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      await axios.delete(`${baseURL}/api/admin/delete-category/${deleteId}`);
      setDataSource((prev) => prev.filter((item) => item._id !== deleteId));
      message.success("Category deleted successfully");
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      message.error("Error deleting category");
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (record: Category) => {
    setEditingCategory(record);
    setIsEditModalOpen(true);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      status: record.status,
      orderPriority: record.orderPriority
    });
    if (record.image) {
      setFileList([{
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: `${baseURL}/uploads/category/${record.image}`
      }]);
    } else {
      setFileList([]);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
    setFileList([]);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("status", values.status);
      formData.append("orderPriority", values.orderPriority);

      const currentFile = fileList[0];
      if (currentFile && !currentFile.url) {
        formData.append("image", currentFile.originFileObj || currentFile);
      }

      if (!editingCategory) return;

      setLoading(true);
      await axios.put(`${baseURL}/api/admin/update-category/${editingCategory._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Category updated successfully");
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Update error", error);
      message.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: (file: any) => { setFileList([]); },
    beforeUpload: (file: any) => { setFileList([file]); return false; },
    fileList,
  };

  // Search
  const filteredCategories = dataSource.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Columns
  const columns: ColumnsType<Category> = [
    {
      title: "Category Name",
      dataIndex: "name",
      render: (text: string) => (
        <span style={{ fontWeight: 500, color: '#0f172a' }}>{text}</span>
      ),
    },
    {
      title: "Image",
      dataIndex: "image",
      render: (text) => {
        if (text) {
          const imageUrl = `${baseURL}/uploads/category/${text}`;
          return (
            <img
              src={imageUrl}
              alt="Category"
              style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "10px", border: "1px solid #e2e8f0" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/48?text=No";
              }}
            />
          );
        }
        return <span style={{ color: '#94a3b8', fontSize: '12px' }}>No Image</span>;
      },
    },
    {
      title: "Slug",
      dataIndex: "slug",
      render: (text: string) => (
        <span style={{ color: '#64748b', fontSize: '12.5px', fontFamily: 'monospace' }}>{text}</span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag
          style={{
            background: status === "Active" ? '#ecfdf5' : '#fef2f2',
            color: status === "Active" ? '#059669' : '#dc2626',
            fontWeight: 600,
            fontSize: '11.5px',
          }}
        >
          {status === "Active" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "orderPriority",
      render: (orderPriority: number) => (
        <Tag style={{ background: '#eef2ff', color: '#4f46e5', fontWeight: 600 }}>{orderPriority}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
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
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => setDeleteId(record._id)}
            style={{ borderRadius: '8px' }}
          />
        </div>
      )
    },
  ];

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ flex: '1 1 250px', maxWidth: '400px' }}>
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            size="large"
            placeholder="Search categories..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              borderRadius: '10px',
              height: '44px',
              border: '1px solid #e2e8f0',
            }}
          />
        </div>

        <Button
          size="large"
          onClick={() => navigate("/admin/categorys/add")}
          icon={<PlusOutlined />}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#fff',
            fontWeight: 600,
            borderRadius: '10px',
            border: 'none',
            height: '44px',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
          }}
        >
          Add Category
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
        <Spin spinning={loading}>
          <Table<Category>
            columns={columns}
            dataSource={filteredCategories}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </div>

      {/* Delete Modal */}
      <Modal
        title="Delete Confirmation"
        open={!!deleteId}
        onOk={handleDelete}
        onCancel={() => setDeleteId(null)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            backgroundColor: '#ef4444',
            color: 'white',
            borderColor: '#ef4444',
            borderRadius: '8px',
            fontWeight: 600,
          }
        }}
        cancelButtonProps={{ style: { borderRadius: '8px' } }}
      >
        <p style={{ color: '#475569', fontSize: '14px' }}>Are you sure you want to delete this category? This action cannot be undone.</p>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Category"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={handleEditCancel}
        okText="Update"
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
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input style={{ borderRadius: '8px', height: '42px' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} style={{ borderRadius: '8px' }} />
          </Form.Item>
          <Form.Item name="orderPriority" label="Order Priority">
            <Input type="number" style={{ borderRadius: '8px', height: '42px' }} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select
              style={{ borderRadius: '8px' }}
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Image">
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: '8px' }}>Select New Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
