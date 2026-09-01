import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Input,
  message,
  Tag,
  Typography,
  Spin,
  Modal,
  Badge,
  Tooltip,
  Popconfirm,
  Empty
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DisconnectOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckCircleFilled,
  SyncOutlined,
  QrcodeOutlined,
  PhoneOutlined,
  UserOutlined,
  StarFilled,
  StarOutlined,
  CheckOutlined,
  MobileOutlined
} from '@ant-design/icons';
import { FaWhatsapp } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import baseURL from '../../config';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export interface WhatsAppSessionItem {
  _id?: string;
  sessionId: string;
  label: string;
  phoneNumber?: string;
  pushName?: string;
  platform?: string;
  status: 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'AUTHENTICATED' | 'READY';
  qr?: string | null;
  isActiveForOtp: boolean;
  isReady: boolean;
  lastConnectedAt?: string;
  createdAt?: string;
}

const WhatsAppIntegration: React.FC = () => {
  const [sessions, setSessions] = useState<WhatsAppSessionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [btnLoadingMap, setBtnLoadingMap] = useState<Record<string, boolean>>({});

  // Add Account Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newAccountLabel, setNewAccountLabel] = useState<string>('');
  const [addingAccount, setAddingAccount] = useState<boolean>(false);

  // Test Message Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [selectedSessionForTest, setSelectedSessionForTest] = useState<WhatsAppSessionItem | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('');
  const [testMessageContent, setTestMessageContent] = useState<string>(
    'Hello! This is a test OTP verification message from your Admin Panel.'
  );
  const [sendingTest, setSendingTest] = useState<boolean>(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/api/admin/whatsapp/sessions`);
      if (res.data && res.data.data) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();

    const socket: Socket = io(baseURL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to WhatsApp Multi-Session service');
    });

    // Real-time updates for all sessions
    socket.on('whatsapp_sessions_list', (data: WhatsAppSessionItem[]) => {
      console.log('Sessions list updated:', data);
      setSessions(data);
      setLoading(false);
    });

    socket.on('whatsapp_session_qr', (data: { sessionId: string; qr: string; status: WhatsAppSessionItem['status'] }) => {
      setSessions((prev) =>
        prev.map((s) => (s.sessionId === data.sessionId ? { ...s, qr: data.qr, status: data.status, isReady: false } : s))
      );
    });

    socket.on('whatsapp_session_ready', (data: { sessionId: string; status: 'READY'; user: any }) => {
      message.success(`WhatsApp Account "${data.user?.name || data.sessionId}" Connected!`);
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === data.sessionId
            ? {
                ...s,
                status: 'READY',
                qr: null,
                isReady: true,
                phoneNumber: data.user?.phone || s.phoneNumber,
                pushName: data.user?.name || s.pushName
              }
            : s
        )
      );
    });

    socket.on('whatsapp_session_disconnected', (data: { sessionId: string; status: 'DISCONNECTED' }) => {
      setSessions((prev) =>
        prev.map((s) => (s.sessionId === data.sessionId ? { ...s, status: 'DISCONNECTED', qr: null, isReady: false } : s))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchSessions]);

  const setBtnLoading = (id: string, isLoading: boolean) => {
    setBtnLoadingMap((prev) => ({ ...prev, [id]: isLoading }));
  };

  const handleCreateAccount = async () => {
    if (!newAccountLabel.trim()) {
      message.warning('Please enter an account name / label');
      return;
    }

    try {
      setAddingAccount(true);
      const res = await axios.post(`${baseURL}/api/admin/whatsapp/sessions/create`, {
        label: newAccountLabel.trim()
      });
      message.success('New WhatsApp account session created! Please scan the QR code.');
      setIsAddModalOpen(false);
      setNewAccountLabel('');
      await fetchSessions();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to create WhatsApp session');
    } finally {
      setAddingAccount(false);
    }
  };

  const handleSetActive = async (session: WhatsAppSessionItem) => {
    try {
      setBtnLoading(session.sessionId, true);
      await axios.post(`${baseURL}/api/admin/whatsapp/sessions/${session.sessionId}/set-active`);
      message.success(`"${session.label}" is now set as the active OTP sender!`);
      await fetchSessions();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to set active session');
    } finally {
      setBtnLoading(session.sessionId, false);
    }
  };

  const handleRestart = async (sessionId: string) => {
    try {
      setBtnLoading(sessionId, true);
      message.loading({ content: 'Generating fresh QR Code...', key: `qr-${sessionId}` });
      await axios.post(`${baseURL}/api/admin/whatsapp/sessions/${sessionId}/restart`);
      message.success({ content: 'QR code generation initialized...', key: `qr-${sessionId}` });
      await fetchSessions();
    } catch (err: any) {
      message.error({ content: err.response?.data?.message || 'Failed to restart session', key: `qr-${sessionId}` });
    } finally {
      setBtnLoading(sessionId, false);
    }
  };

  const handleLogout = async (sessionId: string) => {
    try {
      setBtnLoading(sessionId, true);
      await axios.post(`${baseURL}/api/admin/whatsapp/sessions/${sessionId}/logout`);
      message.success('WhatsApp session disconnected');
      await fetchSessions();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to logout session');
    } finally {
      setBtnLoading(sessionId, false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      setBtnLoading(sessionId, true);
      await axios.delete(`${baseURL}/api/admin/whatsapp/sessions/${sessionId}`);
      message.success('WhatsApp session removed successfully');
      await fetchSessions();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to delete session');
    } finally {
      setBtnLoading(sessionId, false);
    }
  };

  const handleOpenTestModal = (session: WhatsAppSessionItem) => {
    setSelectedSessionForTest(session);
    setIsTestModalOpen(true);
  };

  const handleSendTestMessage = async () => {
    if (!testPhoneNumber.trim()) {
      message.error('Please enter recipient phone number');
      return;
    }
    if (!selectedSessionForTest) return;

    try {
      setSendingTest(true);
      const res = await axios.post(`${baseURL}/api/admin/whatsapp/test-message`, {
        sessionId: selectedSessionForTest.sessionId,
        phoneNumber: testPhoneNumber.trim(),
        message: testMessageContent.trim()
      });
      if (res.data.success) {
        message.success(`Test message sent successfully to ${testPhoneNumber}!`);
        setIsTestModalOpen(false);
      } else {
        message.error(res.data.message || 'Failed to send test message');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Error sending test message');
    } finally {
      setSendingTest(false);
    }
  };

  const renderStatusBadge = (status: WhatsAppSessionItem['status']) => {
    switch (status) {
      case 'READY':
        return (
          <Tag color="success" className="px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center gap-1.5 shadow-sm m-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            Connected
          </Tag>
        );
      case 'QR_READY':
        return (
          <Tag color="processing" className="px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center gap-1.5 shadow-sm m-0">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
            Scan QR
          </Tag>
        );
      case 'INITIALIZING':
        return (
          <Tag color="warning" className="px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center gap-1.5 shadow-sm m-0">
            <SyncOutlined spin /> Initializing...
          </Tag>
        );
      case 'AUTHENTICATED':
        return (
          <Tag color="cyan" className="px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center gap-1.5 shadow-sm m-0">
            <CheckCircleFilled /> Authenticated
          </Tag>
        );
      default:
        return (
          <Tag color="default" className="px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center gap-1.5 shadow-sm m-0">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
            Disconnected
          </Tag>
        );
    }
  };

  const totalConnected = sessions.filter((s) => s.status === 'READY').length;
  const activeOtpSession = sessions.find((s) => s.isActiveForOtp);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner text-white flex-shrink-0">
              <FaWhatsapp />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white m-0">Multi-Account WhatsApp Manager</h1>
                <Tag color="cyan" className="rounded-full px-3 py-0.5 text-xs font-semibold m-0">Multi-Device Ready</Tag>
              </div>
              <p className="text-emerald-100 text-sm md:text-base mt-1.5 max-w-2xl">
                Connect multiple WhatsApp numbers at the same time. Switch active OTP sender or broadcast messages from any linked account whenever you want.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white text-emerald-800 hover:bg-emerald-50 border-none font-semibold rounded-xl h-11 px-5 shadow-md flex-1 sm:flex-initial"
            >
              Add WhatsApp Number
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSessions}
              loading={loading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl h-11 px-4 font-medium"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
            <MobileOutlined className="text-2xl text-emerald-200" />
            <div>
              <div className="text-xs text-emerald-200 font-medium">Total Accounts</div>
              <div className="text-xl font-bold text-white">{sessions.length}</div>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
            <CheckCircleFilled className="text-2xl text-green-300" />
            <div>
              <div className="text-xs text-emerald-200 font-medium">Active & Connected</div>
              <div className="text-xl font-bold text-white">{totalConnected}</div>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
            <StarFilled className="text-2xl text-amber-300" />
            <div>
              <div className="text-xs text-emerald-200 font-medium">Current OTP Sender</div>
              <div className="text-sm font-bold text-white truncate max-w-[180px]">
                {activeOtpSession ? activeOtpSession.label : 'None Selected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      {loading && sessions.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4 text-gray-500">
          <Spin size="large" />
          <p className="text-sm font-medium">Loading WhatsApp accounts...</p>
        </div>
      ) : sessions.length === 0 ? (
        <Card className="rounded-3xl shadow-sm border-gray-100 py-12 text-center">
          <Empty
            description="No WhatsApp accounts created yet."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-xl"
            >
              Add First WhatsApp Number
            </Button>
          </Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((sess) => {
            const isBtnBusy = !!btnLoadingMap[sess.sessionId];

            return (
              <Card
                key={sess.sessionId}
                className={`rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden ${
                  sess.isActiveForOtp ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200'
                }`}
                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                {/* Top Badge & Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-800 text-base m-0">{sess.label}</h3>
                        {sess.isActiveForOtp && (
                          <Tag color="gold" className="rounded-full text-[10px] font-bold uppercase tracking-wider px-2 m-0 flex items-center gap-1 shadow-sm">
                            <StarFilled /> Active OTP Sender
                          </Tag>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">ID: {sess.sessionId}</span>
                    </div>
                    {renderStatusBadge(sess.status)}
                  </div>

                  {/* Body Content based on status */}
                  <div className="my-4">
                    {sess.status === 'READY' ? (
                      /* Connected Details */
                      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 text-left space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1.5">
                            <PhoneOutlined /> Phone Number
                          </span>
                          <span className="font-bold text-emerald-700 text-sm">
                            {sess.phoneNumber ? `+${sess.phoneNumber}` : 'Connected'}
                          </span>
                        </div>
                        {sess.pushName && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 flex items-center gap-1.5">
                              <UserOutlined /> WhatsApp Name
                            </span>
                            <span className="font-medium text-gray-800">{sess.pushName}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-100/60">
                          <span className="text-gray-400">Status</span>
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckOutlined /> Ready to dispatch
                          </span>
                        </div>
                      </div>
                    ) : sess.qr ? (
                      /* QR Code Preview */
                      <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 inline-block mb-3">
                          <QRCodeSVG value={sess.qr} size={170} level="M" />
                        </div>
                        <span className="text-xs text-gray-600 font-medium flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
                          Scan with this WhatsApp number
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Open WhatsApp → Linked Devices → Link a Device
                        </span>
                      </div>
                    ) : sess.status === 'INITIALIZING' ? (
                      /* Initializing State */
                      <div className="py-10 flex flex-col items-center justify-center text-center gap-2 bg-slate-50 rounded-xl">
                        <Spin size="default" />
                        <span className="text-xs text-gray-500 font-medium">Starting engine & generating QR...</span>
                      </div>
                    ) : (
                      /* Disconnected */
                      <div className="py-8 flex flex-col items-center justify-center text-center gap-2 bg-slate-50 rounded-xl">
                        <DisconnectOutlined className="text-3xl text-gray-300" />
                        <span className="text-xs text-gray-500">Account is disconnected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-gray-100 space-y-2 mt-auto">
                  {/* Active Toggle */}
                  {sess.status === 'READY' && (
                    <Button
                      type={sess.isActiveForOtp ? 'default' : 'primary'}
                      icon={sess.isActiveForOtp ? <StarFilled className="text-amber-500" /> : <StarOutlined />}
                      onClick={() => handleSetActive(sess)}
                      loading={isBtnBusy}
                      disabled={sess.isActiveForOtp}
                      className={`w-full rounded-xl font-medium text-xs h-9 ${
                        sess.isActiveForOtp ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {sess.isActiveForOtp ? 'Currently Active for OTP' : 'Set as Active OTP Sender'}
                    </Button>
                  )}

                  <div className="flex items-center gap-2">
                    {sess.status === 'READY' && (
                      <Button
                        icon={<SendOutlined />}
                        onClick={() => handleOpenTestModal(sess)}
                        className="flex-1 rounded-xl text-xs h-8 border-gray-300 font-medium"
                      >
                        Test Message
                      </Button>
                    )}

                    <Tooltip title="Regenerate QR / Re-authenticate">
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => handleRestart(sess.sessionId)}
                        loading={isBtnBusy}
                        className="rounded-xl text-xs h-8 text-gray-600"
                      />
                    </Tooltip>

                    {sess.status === 'READY' && (
                      <Popconfirm
                        title="Disconnect WhatsApp?"
                        description="Are you sure you want to disconnect this number?"
                        onConfirm={() => handleLogout(sess.sessionId)}
                        okText="Disconnect"
                        cancelText="Cancel"
                      >
                        <Tooltip title="Disconnect session">
                          <Button
                            danger
                            icon={<DisconnectOutlined />}
                            loading={isBtnBusy}
                            className="rounded-xl text-xs h-8"
                          />
                        </Tooltip>
                      </Popconfirm>
                    )}

                    <Popconfirm
                      title="Delete Account?"
                      description="Delete this WhatsApp account and its session permanently?"
                      onConfirm={() => handleDelete(sess.sessionId)}
                      okText="Delete"
                      okType="danger"
                      cancelText="Cancel"
                    >
                      <Tooltip title="Delete account">
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          loading={isBtnBusy}
                          className="rounded-xl text-xs h-8 text-gray-400 hover:text-red-500"
                        />
                      </Tooltip>
                    </Popconfirm>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Add New Account */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-gray-800 font-bold">
            <PlusOutlined className="text-emerald-600" />
            <span>Add New WhatsApp Account</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          setNewAccountLabel('');
        }}
        onOk={handleCreateAccount}
        confirmLoading={addingAccount}
        okText="Create & Generate QR"
        okButtonProps={{ className: 'bg-emerald-600 hover:bg-emerald-700 border-none rounded-xl' }}
        cancelButtonProps={{ className: 'rounded-xl' }}
      >
        <div className="py-4 space-y-4">
          <p className="text-xs text-gray-500">
            Give this WhatsApp account a recognizable label (e.g. "Support Number", "Admin Mobile", "Marketing 2"). Once created, a fresh QR code will be generated for you to scan.
          </p>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Account Label / Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Sales Team Number, Support Desk, Personal SIM"
              value={newAccountLabel}
              onChange={(e) => setNewAccountLabel(e.target.value)}
              className="rounded-xl py-2"
              autoFocus
              onPressEnter={handleCreateAccount}
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Send Test Message */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-gray-800 font-bold">
            <SendOutlined className="text-emerald-600" />
            <span>Send Test Message from "{selectedSessionForTest?.label}"</span>
          </div>
        }
        open={isTestModalOpen}
        onCancel={() => {
          setIsTestModalOpen(false);
          setTestPhoneNumber('');
        }}
        onOk={handleSendTestMessage}
        confirmLoading={sendingTest}
        okText="Send Message"
        okButtonProps={{ className: 'bg-emerald-600 hover:bg-emerald-700 border-none rounded-xl' }}
        cancelButtonProps={{ className: 'rounded-xl' }}
      >
        <div className="py-3 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">Sender Account:</span>
            <span className="font-semibold text-emerald-700">{selectedSessionForTest?.label} (+{selectedSessionForTest?.phoneNumber})</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Recipient Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="e.g. 9876543210 or 919876543210"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
              className="rounded-xl py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Message Content
            </label>
            <TextArea
              rows={3}
              value={testMessageContent}
              onChange={(e) => setTestMessageContent(e.target.value)}
              placeholder="Type message..."
              className="rounded-xl"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WhatsAppIntegration;
