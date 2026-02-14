import React, { useEffect, useState } from "react";
import { Table, Avatar, Tag, Button, Modal, Form, Input, Upload, message } from "antd";
import { EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import baseURL from "../../config";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/api/admin/all-users`);
      let userdata = Array.isArray(res.data) ? res.data.reverse() : [];
      setUsers(userdata);
    } catch (err) {
      console.error("Failed to fetch users", err);
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${baseURL}/api/admin/delete-user/${deleteId}`);
      message.success("User deleted successfully");
      setUsers(prev => prev.filter(u => u._id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Delete error", error);
      message.error("Failed to delete user");
    }
  };

  const handleEdit = (record: any) => {
    setEditingUser(record);
    setIsEditModalOpen(true);
    form.setFieldsValue({
      name: record.name,
      address: record.address,
      pincode: record.pincode
    });

    if (record.profileImage) {
      setFileList([{
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: `${baseURL}/${record.profileImage}`
      }]);
    } else {
      setFileList([]);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("name", values.name || "");
      formData.append("address", values.address || "");
      formData.append("pincode", values.pincode || "");

      const currentFile = fileList[0];
      if (currentFile && !currentFile.url) {
        formData.append("profileImage", currentFile.originFileObj || currentFile);
      }

      if (!editingUser) return;

      setLoading(true);
      await axios.put(`${baseURL}/api/admin/update-user/${editingUser._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("User updated successfully");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Update error", error);
      message.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: (file: any) => { setFileList([]); },
    beforeUpload: (file: any) => { setFileList([file]); return false; },
    fileList,
  };

  const columns = [
    {
      title: "Profile",
      dataIndex: "profileImage",
      render: (img: string, record: any) => (
        <Avatar
          size={40}
          src={img ? `${baseURL}/${img}` : undefined}
          style={{
            backgroundColor: '#eef2ff',
            color: '#6366f1',
            fontWeight: 600,
            fontSize: '15px',
            border: '2px solid #e2e8f0',
          }}
        >
          {record.name ? record.name.charAt(0).toUpperCase() : 'U'}
        </Avatar>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => text ? (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{text}</span>
      ) : (
        <Tag style={{ background: '#fffbeb', color: '#d97706', fontWeight: 500 }}>Not Updated</Tag>
      ),
    },
    {
      title: "Mobile",
      dataIndex: "mobileno",
      key: "mobileno",
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '12.5px' }}>{text}</span>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text: string) => <span style={{ color: '#475569' }}>{text || "—"}</span>,
    },
    {
      title: "Pincode",
      dataIndex: "pincode",
      key: "pincode",
      render: (text: string) => <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{text || "—"}</span>,
    },
    {
      title: "Joined On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <span style={{ color: '#64748b', fontSize: '12.5px' }}>
          {moment(date).format("DD MMM YYYY")}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
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
    }
  ];

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            {users.length} total users registered
          </p>
        </div>
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
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
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
        <p style={{ color: '#475569', fontSize: '14px' }}>Are you sure you want to delete this user? This action cannot be undone.</p>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit User"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
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
          <Form.Item name="name" label="Name">
            <Input style={{ borderRadius: '8px', height: '42px' }} />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} style={{ borderRadius: '8px' }} />
          </Form.Item>
          <Form.Item name="pincode" label="Pincode">
            <Input style={{ borderRadius: '8px', height: '42px' }} />
          </Form.Item>
          <Form.Item label="Profile Image">
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: '8px' }}>Select New Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
