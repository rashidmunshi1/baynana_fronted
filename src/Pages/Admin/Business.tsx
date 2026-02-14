import React, { useState, useEffect } from "react";
import { Table, Button, Input, Modal, Card, Row, Col, Spin, Tag, Select, Checkbox, message } from "antd";
import { SearchOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import baseURL from "../../config";

const { Option } = Select;

const BusinessListPage = () => {
  const [searchText, setSearchText] = useState("");
  const [businessList, setBusinessList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paidFilter, setPaidFilter] = useState<boolean | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [currentBusiness, setCurrentBusiness] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedAction, setSelectedAction] = useState<"approve" | "reject" | null>(null);

  const navigate = useNavigate();

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/api/admin/all-business`);
      let sorted = res.data.sort((a: any, b: any) => {
        if (a.approvalStatus === 'pending' && b.approvalStatus !== 'pending') return -1;
        if (a.approvalStatus !== 'pending' && b.approvalStatus === 'pending') return 1;
        return 0;
      });
      setBusinessList(sorted || []);
    } catch (err) {
      console.log("Error while fetching business");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, []);

  const filteredBusinesses = businessList.filter((b: any) =>
    (paidFilter === null || b.isPaid === paidFilter) &&
    (b.businessName.toLowerCase().includes(searchText.toLowerCase()) ||
      b.city.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleStatusClick = (record: any) => {
    setCurrentBusiness(record);
    setRejectReason(record.rejectionReason || "");
    setSelectedAction(null);
    setStatusModalOpen(true);
  };

  const submitStatusChange = async () => {
    if (!selectedAction) {
      message.error("Please select an action (Approve or Reject)");
      return;
    }
    if (selectedAction === 'reject' && !rejectReason.trim()) {
      message.error("Please provide a reason for rejection.");
      return;
    }
    const newStatus = selectedAction === 'approve' ? 'approved' : 'rejected';
    try {
      await axios.put(`${baseURL}/api/admin/business/toggle-status/${currentBusiness._id}`, {
        status: newStatus,
        reason: newStatus === 'rejected' ? rejectReason : ""
      });
      message.success(`Business ${newStatus} successfully!`);
      setStatusModalOpen(false);
      fetchBusiness();
    } catch (error) {
      console.error(error);
      message.error("Failed to update status");
    }
  };

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_: any, __: any, index: number) => (
        <span style={{ color: '#94a3b8', fontWeight: 500 }}>{index + 1}</span>
      ),
      width: 60,
    },
    {
      title: "Business Name",
      dataIndex: "businessName",
      key: "businessName",
      width: 180,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{text}</span>
      ),
    },
    {
      title: "Sub Category",
      dataIndex: "subcategories",
      key: "subcategories",
      width: 180,
      render: (subcats: any[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {subcats && subcats.length > 0 ? (
            subcats.map((sub: any) => (
              <Tag key={sub._id} style={{ background: '#eef2ff', color: '#4f46e5', fontWeight: 500 }}>
                {sub.name}
              </Tag>
            ))
          ) : (
            <span style={{ color: '#94a3b8' }}>—</span>
          )}
        </div>
      ),
    },
    {
      title: "Owner",
      dataIndex: "ownerName",
      key: "ownerName",
      width: 130,
      render: (text: string) => <span style={{ color: '#334155' }}>{text}</span>,
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      width: 120,
      render: (text: string) => <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '12.5px' }}>{text}</span>,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      width: 100,
    },
    {
      title: "Status",
      key: "approvalStatus",
      width: 140,
      render: (record: any) => {
        let bgColor = '#fffbeb';
        let textColor = '#d97706';
        let text = "Pending";

        if (record.approvalStatus === "approved") {
          bgColor = '#ecfdf5';
          textColor = '#059669';
          text = "Approved";
        } else if (record.approvalStatus === "rejected") {
          bgColor = '#fef2f2';
          textColor = '#dc2626';
          text = "Rejected";
        }

        return (
          <Tag
            style={{
              background: bgColor,
              color: textColor,
              cursor: "pointer",
              fontSize: "11.5px",
              fontWeight: 600,
              padding: "4px 12px",
              transition: 'all 200ms ease',
            }}
            onClick={() => handleStatusClick(record)}
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Payment",
      key: "isPaid",
      width: 90,
      render: (record: any) =>
        record.isPaid ? (
          <Tag style={{ background: '#ecfdf5', color: '#059669', fontWeight: 600 }}>Paid</Tag>
        ) : (
          <Tag style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 600 }}>Unpaid</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: any) => (
        <Button
          type="text"
          onClick={() => navigate(`/admin/business-list/update/${record._id}`)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EditOutlined style={{ color: "#6366f1", fontSize: 16 }} />
        </Button>
      ),
      width: 80,
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
        <div style={{ flex: '1 1 250px', maxWidth: '350px' }}>
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            size="large"
            placeholder="Search by name or city..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderRadius: '10px', height: '44px', border: '1px solid #e2e8f0' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Select
            size="large"
            value={paidFilter}
            onChange={(value) => setPaidFilter(value)}
            style={{ width: '120px', borderRadius: '10px' }}
            placeholder="Filter"
          >
            <Option value={null}>All</Option>
            <Option value={true}>Paid</Option>
            <Option value={false}>Unpaid</Option>
          </Select>

          <Button
            size="large"
            onClick={() => navigate("/admin/business-list/add")}
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
            Add Business
          </Button>
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
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredBusinesses}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </div>

      {/* Status Modal */}
      <Modal
        title={
          <span style={{ fontWeight: 600, fontSize: '16px' }}>
            Update Status: {currentBusiness?.businessName}
          </span>
        }
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setStatusModalOpen(false)} style={{ borderRadius: '8px' }}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={submitStatusChange}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            Update Status
          </Button>
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '12px' }}>
          <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>
            Please review the business details and select an action.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div
              style={{
                border: `2px solid ${selectedAction === 'approve' ? '#10b981' : '#e2e8f0'}`,
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                flex: 1,
                textAlign: 'center',
                background: selectedAction === 'approve' ? '#ecfdf5' : '#fff',
                transition: 'all 200ms ease',
              }}
              onClick={() => setSelectedAction('approve')}
            >
              <h4 style={{ fontWeight: 700, color: '#059669', margin: '0 0 4px', fontSize: '14px' }}>Approve</h4>
              <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: 0 }}>Publicly Visible</p>
            </div>

            <div
              style={{
                border: `2px solid ${selectedAction === 'reject' ? '#ef4444' : '#e2e8f0'}`,
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                flex: 1,
                textAlign: 'center',
                background: selectedAction === 'reject' ? '#fef2f2' : '#fff',
                transition: 'all 200ms ease',
              }}
              onClick={() => setSelectedAction('reject')}
            >
              <h4 style={{ fontWeight: 700, color: '#dc2626', margin: '0 0 4px', fontSize: '14px' }}>Reject</h4>
              <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: 0 }}>Hidden & Notify</p>
            </div>
          </div>

          {selectedAction === 'reject' && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Rejection Reason:</label>
              <Checkbox.Group
                style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}
                onChange={(checkedValues) => setRejectReason(checkedValues.join(", "))}
              >
                <Checkbox value="Invalid Images">Invalid or Low Quality Images</Checkbox>
                <Checkbox value="Incomplete Details">Incomplete Business Details</Checkbox>
                <Checkbox value="Duplicate Listing">Duplicate Listing</Checkbox>
                <Checkbox value="Policy Violation">Violation of Terms</Checkbox>
              </Checkbox.Group>
              <Input.TextArea
                style={{ marginTop: '12px', borderRadius: '8px' }}
                rows={2}
                placeholder="Other reason (optional)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default BusinessListPage;
