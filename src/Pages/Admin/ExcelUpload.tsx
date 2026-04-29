import React, { useState, useEffect, useRef } from 'react';
import { Upload, Button, message, Table, Card, Typography, Modal, Space, Popconfirm, Tag } from 'antd';
import { InboxOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';
import baseURL from '../../config';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ExcelUpload: React.FC = () => {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [uploadsList, setUploadsList] = useState<any[]>([]);
  const [fetchingUploads, setFetchingUploads] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedUploadName, setSelectedUploadName] = useState('');

  const dataRef = useRef<any[]>([]);

  const fetchUploads = () => {
    setFetchingUploads(true);
    axios.get(`${baseURL}/api/admin/excel-uploads`)
      .then((response) => {
        if (response.data.success && response.data.data) {
          const formatted = response.data.data.map((item: any) => ({
            ...item,
            key: item._id,
          }));
          setUploadsList(formatted);
        }
      })
      .catch((err) => {
        console.error("Fetch uploads error:", err);
      })
      .finally(() => {
        setFetchingUploads(false);
      });
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const dataColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (val: any) => val ? String(val) : '-',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (val: any) => {
        if (!val) return '-';
        const s = String(val);
        return s.length > 100 ? s.substring(0, 100) + '...' : s;
      }
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (val: any) => val ? String(val) : '-',
    },
  ];

  const uploadsColumns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Records',
      dataIndex: 'recordCount',
      key: 'recordCount',
      align: 'center' as const,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewData(record)}
            style={{ backgroundColor: '#1677ff', color: '#fff' }}
          >
            View
          </Button>
          <Popconfirm
            title="Delete Upload"
            description="Are you sure you want to delete this upload and all its associated data?"
            onConfirm={() => handleDeleteUpload(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              style={{ backgroundColor: '#ff4d4f', color: '#fff' }}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleViewData = (record: any) => {
    setSelectedUploadName(record.fileName);
    setIsModalVisible(true);
    setModalLoading(true);
    axios.get(`${baseURL}/api/admin/excel-data/upload/${record._id}`)
      .then((res) => {
        if (res.data.success) {
          setModalData(res.data.data.map((item: any) => ({ ...item, key: item._id })));
        }
      })
      .catch((err) => {
        console.error("Fetch modal data error:", err);
        message.error("Failed to load upload data");
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const handleDeleteUpload = (id: string) => {
    axios.delete(`${baseURL}/api/admin/excel-upload/${id}`)
      .then((res) => {
        if (res.data.success) {
          message.success("Upload deleted successfully");
          fetchUploads();
        }
      })
      .catch((err) => {
        console.error("Delete upload error:", err);
        message.error("Failed to delete upload");
      });
  };

  const handleFileUpload = (file: File) => {
    setCurrentFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        const workbook = XLSX.read(fileData, { type: 'binary' });

        // Pick the sheet that has recognized headers (Catagory/Title/Discription)
        // If none found, fall back to the sheet with most rows
        let bestSheet: any = null;
        let fallbackSheet: any = null;
        let fallbackRows = 0;

        for (let s = 0; s < workbook.SheetNames.length; s++) {
          const ws = workbook.Sheets[workbook.SheetNames[s]];
          if (!ws['!ref']) continue;
          const range = XLSX.utils.decode_range(ws['!ref']);
          const rowCount = range.e.r - range.s.r + 1;

          // Check if this sheet has category/title headers in row 0
          const cellA = ws[XLSX.utils.encode_cell({ r: range.s.r, c: 0 })];
          const cellB = ws[XLSX.utils.encode_cell({ r: range.s.r, c: 1 })];
          const a = cellA ? String(cellA.v || '').toLowerCase() : '';
          const b = cellB ? String(cellB.v || '').toLowerCase() : '';

          if (a.includes('cat') || b.includes('title')) {
            bestSheet = ws;
            break; // prefer this sheet
          }

          if (rowCount > fallbackRows) {
            fallbackRows = rowCount;
            fallbackSheet = ws;
          }
        }

        const sheet = bestSheet || fallbackSheet;
        if (!sheet || !sheet['!ref']) {
          message.warning("The Excel file is empty.");
          return;
        }

        const range = XLSX.utils.decode_range(sheet['!ref']);

        // Helper: read raw cell value
        const getCell = (r: number, c: number): any => {
          const cell = sheet[XLSX.utils.encode_cell({ r, c })];
          if (!cell) return null;
          return cell.v !== undefined && cell.v !== null && cell.v !== '' ? cell.v : null;
        };

        // Detect columns from header row
        let catCol = 0, titleCol = 1, descCol = 2;
        let startRow = range.s.r;
        const h0 = String(getCell(range.s.r, 0) || '').toLowerCase();
        const h1 = String(getCell(range.s.r, 1) || '').toLowerCase();

        if (h0.includes('cat') || h1.includes('title')) {
          startRow = range.s.r + 1; // skip header
          for (let c = range.s.c; c <= range.e.c; c++) {
            const hv = String(getCell(range.s.r, c) || '').toLowerCase();
            if (hv.includes('cat')) catCol = c;
            if (hv.includes('title')) titleCol = c;
            if (hv.includes('desc') || hv.includes('disc')) descCol = c;
          }
        }

        let formattedData: any[] = [];
        let currentCategory: any = '';
        let currentItem: any = null;
        let idx = 0;

        for (let r = startRow; r <= range.e.r; r++) {
          const catVal = getCell(r, catCol);
          const titleVal = getCell(r, titleCol);
          const descVal = getCell(r, descCol);

          if (catVal === null && titleVal === null && descVal === null) continue;

          // Category: exact value from cell, no split, no trim, no change
          if (catVal !== null) {
            currentCategory = catVal;
          }

          if (titleVal !== null) {
            currentItem = {
              key: String(idx++),
              category: currentCategory,  // full comma-separated string as-is
              title: titleVal,
              description: descVal !== null ? descVal : '',
            };
            formattedData.push(currentItem);
          } else if (descVal !== null && currentItem) {
            currentItem.description += (currentItem.description ? '\n\n' : '') + descVal;
          }
        }

        dataRef.current = formattedData;
        setPreviewData(formattedData);
        message.success('Parsed ' + formattedData.length + ' records.');
      } catch (error) {
        console.error("Parse error:", error);
        message.error('Failed to parse Excel file.');
      }
    };

    reader.readAsBinaryString(file);
    return false;
  };

  const submitUpload = () => {
    const items = dataRef.current;
    if (!items || items.length === 0) {
      alert('No data to upload');
      return;
    }

    setUploading(true);

    // Send category as-is string, no array conversion
    const payload = items.map((item: any) => ({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
    }));

    axios.post(`${baseURL}/api/admin/excel-data`, { 
      data: payload,
      fileName: currentFileName 
    })
      .then(response => {
        const result = response.data;
        if (result.success) {
          message.success('Successfully uploaded ' + result.count + ' records!');
          dataRef.current = [];
          setPreviewData([]);
          setCurrentFileName('');
          fetchUploads();
        } else {
          message.error(result.message || 'Upload failed');
        }
      })
      .catch(err => {
        console.error('Upload error:', err);
        message.error('Error uploading data');
      })
      .finally(() => {
        setUploading(false);
      });
  };

  return (
    <>
      <div style={{ padding: '24px', background: '#fff', minHeight: 'calc(100vh - 120px)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#1e293b' }}>
              Excel Upload Management
            </Title>
            <Text style={{ color: '#64748b' }}>Manage your bulk data uploads and view imported records</Text>
          </div>
        </div>

        <Card style={{ marginBottom: '24px', border: '1px dashed #d9d9d9', background: '#fafafa' }}>
          <Dragger 
            accept=".xlsx,.xls,.csv" 
            beforeUpload={handleFileUpload} 
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: '#3b82f6', fontSize: '48px' }} />
            </p>
            <p className="ant-upload-text" style={{ fontWeight: 600 }}>Click or drag file to this area to parse</p>
            <p className="ant-upload-hint" style={{ color: '#94a3b8' }}>
              Supported: .xlsx, .xls, .csv
            </p>
            {currentFileName && (
              <div style={{ marginTop: '10px' }}>
                <Tag color="processing" style={{ padding: '4px 12px', fontSize: '14px' }}>
                  Selected: {currentFileName}
                </Tag>
              </div>
            )}
          </Dragger>
        </Card>

        {previewData.length > 0 && (
          <Card 
            title={`Preview Data (${previewData.length} records from "${currentFileName}")`}
            style={{ marginBottom: '40px' }}
            extra={
              <Button
                type="primary"
                loading={uploading}
                onClick={submitUpload}
                size="large"
                style={{ borderRadius: '8px', backgroundColor: '#1677ff', color: '#fff' }}
              >
                Upload to Server
              </Button>
            }
          >
            <Table 
              dataSource={previewData} 
              columns={dataColumns} 
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
              bordered
              size="middle"
            />
          </Card>
        )}

        <div style={{ marginTop: '40px' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>Upload History</Title>
          <Table 
            dataSource={uploadsList} 
            columns={uploadsColumns} 
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
            bordered
            size="middle"
            loading={fetchingUploads}
          />
        </div>
      </div>

      <Modal
        title={`Data for: ${selectedUploadName}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)} style={{ border: '1px solid #d9d9d9' }}>
            Close
          </Button>
        ]}
        width={1000}
      >
        <Table 
          dataSource={modalData} 
          columns={dataColumns} 
          pagination={{ pageSize: 10 }}
          loading={modalLoading}
          bordered
          size="middle"
          scroll={{ y: 500 }}
        />
      </Modal>
    </>
  );
};

export default ExcelUpload;
