import React, { useState, useEffect } from "react";
import { Table, Button, Input, Modal, Card, Row, Col, Spin, Tag, Select, Checkbox, message, Tooltip, Badge, Space } from "antd";
import { SearchOutlined, EditOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
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

  // Bulk Selection State
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | null>(null);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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
    (statusFilter === null || b.approvalStatus === statusFilter) &&
    (b.businessName.toLowerCase().includes(searchText.toLowerCase()) ||
      b.city.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Single status change
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

  // ══════════════════════════════════════════════
  // BULK ACTIONS
  // ══════════════════════════════════════════════
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: any) => ({
      name: record._id,
    }),
  };

  const hasSelected = selectedRowKeys.length > 0;

  const openBulkModal = (action: "approve" | "reject") => {
    setBulkAction(action);
    setBulkRejectReason("");
    setBulkModalOpen(true);
  };

  const submitBulkAction = async () => {
    if (!bulkAction) return;

    if (bulkAction === 'reject' && !bulkRejectReason.trim()) {
      message.error("Please provide a reason for rejection.");
      return;
    }

    setBulkLoading(true);
    try {
      const newStatus = bulkAction === 'approve' ? 'approved' : 'rejected';
      await axios.put(`${baseURL}/api/admin/business/bulk-status`, {
        ids: selectedRowKeys,
        status: newStatus,
        reason: newStatus === 'rejected' ? bulkRejectReason : ""
      });
      message.success(`${selectedRowKeys.length} business(es) ${newStatus} successfully!`);
      setBulkModalOpen(false);
      setSelectedRowKeys([]);
      fetchBusiness();
    } catch (error) {
      console.error(error);
      message.error("Bulk operation failed");
    } finally {
      setBulkLoading(false);
    }
  };

  // Select only pending businesses (quick action)
  const selectAllPending = () => {
    const pendingIds = filteredBusinesses
      .filter((b: any) => b.approvalStatus === 'pending')
      .map((b: any) => b._id);
    setSelectedRowKeys(pendingIds);
    if (pendingIds.length === 0) {
      message.info("No pending businesses found");
    } else {
      message.success(`${pendingIds.length} pending business(es) selected`);
    }
  };

  // Counts for stats
  const pendingCount = businessList.filter((b: any) => b.approvalStatus === 'pending').length;
  const approvedCount = businessList.filter((b: any) => b.approvalStatus === 'approved').length;
  const rejectedCount = businessList.filter((b: any) => b.approvalStatus === 'rejected').length;

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

      {/* ── Status Overview Cards ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', count: businessList.length, bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: <ThunderboltOutlined /> },
          { label: 'Pending', count: pendingCount, bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: <ExclamationCircleOutlined />, filterValue: 'pending' },
          { label: 'Approved', count: approvedCount, bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: <CheckCircleOutlined />, filterValue: 'approved' },
          { label: 'Rejected', count: rejectedCount, bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: <CloseCircleOutlined />, filterValue: 'rejected' },
        ].map((item: any) => (
          <div
            key={item.label}
            onClick={() => setStatusFilter(statusFilter === item.filterValue ? null : (item.filterValue || null))}
            style={{
              background: item.bg,
              borderRadius: '14px',
              padding: '16px 22px',
              minWidth: '0',
              flex: '1 1 0',
              cursor: item.filterValue ? 'pointer' : 'default',
              boxShadow: statusFilter === item.filterValue
                ? '0 4px 20px rgba(0,0,0,0.25), 0 0 0 3px rgba(255,255,255,0.4)'
                : '0 2px 10px rgba(0,0,0,0.1)',
              transition: 'all 250ms ease',
              transform: statusFilter === item.filterValue ? 'scale(1.03)' : 'scale(1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>{item.label}</div>
                <div style={{ color: '#fff', fontSize: '26px', fontWeight: 700, lineHeight: 1 }}>{item.count}</div>
              </div>
              <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)' }}>{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Header Row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
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

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
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

      {/* ── Bulk Action Bar ── */}
      <div
        style={{
          background: hasSelected
            ? 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 50%, #f0fdf4 100%)'
            : 'transparent',
          borderRadius: '14px',
          padding: hasSelected ? '14px 20px' : '0',
          marginBottom: hasSelected ? '16px' : '0',
          border: hasSelected ? '1px solid #c7d2fe' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          transition: 'all 300ms ease',
          overflow: 'hidden',
          maxHeight: hasSelected ? '100px' : '0',
          opacity: hasSelected ? 1 : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Badge
            count={selectedRowKeys.length}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              fontWeight: 700,
              fontSize: '13px',
              boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
            }}
          />
          <span style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>
            {selectedRowKeys.length} Business(es) Selected
          </span>
        </div>

        <Space size={10}>
          <Tooltip title="Select all pending businesses">
            <Button
              size="middle"
              onClick={selectAllPending}
              style={{
                borderRadius: '8px',
                border: '1px solid #fbbf24',
                color: '#d97706',
                fontWeight: 600,
                fontSize: '13px',
              }}
              icon={<ExclamationCircleOutlined />}
            >
              Select Pending
            </Button>
          </Tooltip>

          <Button
            size="middle"
            onClick={() => openBulkModal('approve')}
            disabled={!hasSelected}
            icon={<CheckCircleOutlined />}
            style={{
              background: hasSelected ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#e2e8f0',
              color: hasSelected ? '#fff' : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: hasSelected ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none',
            }}
          >
            Bulk Approve
          </Button>

          <Button
            size="middle"
            onClick={() => openBulkModal('reject')}
            disabled={!hasSelected}
            icon={<CloseCircleOutlined />}
            style={{
              background: hasSelected ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#e2e8f0',
              color: hasSelected ? '#fff' : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: hasSelected ? '0 2px 8px rgba(239, 68, 68, 0.35)' : 'none',
            }}
          >
            Bulk Reject
          </Button>

          <Button
            size="middle"
            onClick={() => setSelectedRowKeys([])}
            style={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              fontWeight: 500,
              fontSize: '13px',
            }}
          >
            Clear
          </Button>
        </Space>
      </div>

      {/* ── Quick Select Pending (always visible if pending exist) ── */}
      {!hasSelected && pendingCount > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <Button
            size="small"
            onClick={selectAllPending}
            icon={<ThunderboltOutlined />}
            style={{
              borderRadius: '8px',
              border: '1px dashed #fbbf24',
              color: '#d97706',
              fontWeight: 600,
              fontSize: '12px',
              background: '#fffbeb',
            }}
          >
            Quick: Select All {pendingCount} Pending
          </Button>
        </div>
      )}

      {/* ── Table ── */}
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
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredBusinesses}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </div>

      {/* ── Single Status Modal ── */}
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

      {/* ── Bulk Action Confirmation Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {bulkAction === 'approve' ? (
              <CheckCircleOutlined style={{ color: '#10b981', fontSize: '20px' }} />
            ) : (
              <CloseCircleOutlined style={{ color: '#ef4444', fontSize: '20px' }} />
            )}
            <span style={{ fontWeight: 600, fontSize: '16px' }}>
              Bulk {bulkAction === 'approve' ? 'Approve' : 'Reject'} — {selectedRowKeys.length} Business(es)
            </span>
          </div>
        }
        open={bulkModalOpen}
        onCancel={() => setBulkModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setBulkModalOpen(false)} style={{ borderRadius: '8px' }}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={bulkLoading}
            onClick={submitBulkAction}
            style={{
              background: bulkAction === 'approve'
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              boxShadow: bulkAction === 'approve'
                ? '0 2px 8px rgba(16,185,129,0.3)'
                : '0 2px 8px rgba(239,68,68,0.3)',
            }}
          >
            {bulkAction === 'approve' ? 'Approve All' : 'Reject All'}
          </Button>
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '12px' }}>
          {/* Summary info */}
          <div
            style={{
              background: bulkAction === 'approve' ? '#ecfdf5' : '#fef2f2',
              borderRadius: '12px',
              padding: '16px 20px',
              border: `1px solid ${bulkAction === 'approve' ? '#a7f3d0' : '#fecaca'}`,
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, color: bulkAction === 'approve' ? '#065f46' : '#991b1b', fontSize: '14px' }}>
              {bulkAction === 'approve'
                ? `✅ ${selectedRowKeys.length} business(es) will be approved and made publicly visible.`
                : `❌ ${selectedRowKeys.length} business(es) will be rejected and hidden from public.`
              }
            </p>
          </div>

          {/* Show selected business names */}
          <div style={{ maxHeight: '140px', overflowY: 'auto', paddingRight: '4px' }}>
            {selectedRowKeys.map((id, idx) => {
              const biz: any = businessList.find((b: any) => b._id === id);
              return biz ? (
                <div
                  key={id as string}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: idx % 2 === 0 ? '#f8fafc' : '#fff',
                    marginBottom: '2px',
                  }}
                >
                  <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 500, minWidth: '24px' }}>{idx + 1}.</span>
                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{biz.businessName}</span>
                  <Tag style={{
                    marginLeft: 'auto',
                    fontSize: '10px',
                    fontWeight: 600,
                    background: biz.approvalStatus === 'pending' ? '#fffbeb' : biz.approvalStatus === 'approved' ? '#ecfdf5' : '#fef2f2',
                    color: biz.approvalStatus === 'pending' ? '#d97706' : biz.approvalStatus === 'approved' ? '#059669' : '#dc2626',
                  }}>
                    {biz.approvalStatus}
                  </Tag>
                </div>
              ) : null;
            })}
          </div>

          {/* Reject reason for bulk reject */}
          {bulkAction === 'reject' && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Rejection Reason:</label>
              <Checkbox.Group
                style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}
                onChange={(checkedValues) => setBulkRejectReason(checkedValues.join(", "))}
              >
                <Checkbox value="Invalid Images">Invalid or Low Quality Images</Checkbox>
                <Checkbox value="Incomplete Details">Incomplete Business Details</Checkbox>
                <Checkbox value="Duplicate Listing">Duplicate Listing</Checkbox>
                <Checkbox value="Policy Violation">Violation of Terms</Checkbox>
              </Checkbox.Group>
              <Input.TextArea
                style={{ marginTop: '12px', borderRadius: '8px' }}
                rows={2}
                placeholder="Additional reason (optional)..."
                value={bulkRejectReason}
                onChange={(e) => setBulkRejectReason(e.target.value)}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default BusinessListPage;
