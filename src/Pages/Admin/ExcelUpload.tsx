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
      dataIndex: 'categories',
      key: 'categories',
      render: (val: any) => {
        if (!val) return '-';
        if (Array.isArray(val)) return val.map((c: string) => <Tag color="blue" key={c}>{c}</Tag>);
        return <Tag color="blue">{String(val)}</Tag>;
      },
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
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let formattedData: any[] = [];
        
        const firstRow: any = parsedData[0] || [];
        const isStandardHeader = firstRow.some((col: any) => 
            typeof col === 'string' && ['title', 'category', 'description'].includes(col.toLowerCase())
        );

        if (isStandardHeader) {
            const objectData: any[] = XLSX.utils.sheet_to_json(sheet);
            formattedData = objectData.map((item: any, index: number) => {
                let categories: string[] = [];
                const cat = item.Category || item.category || '';
                if (cat) {
                    categories = typeof cat === 'string' ? cat.split(',').map((c: string) => c.trim()) : [String(cat)];
                }
                return {
                    key: String(index),
                    title: item.title || item.Title || '',
                    description: item.description || item.Description || '',
                    categories: categories,
                };
            });
        } else {
            let currentCategory = '';
            let currentItem: any = null;
            let currentIndex = 0;

            parsedData.forEach((row: any) => {
                if (!row || row.length === 0) return;
                const colCat = row[0] ? String(row[0]).trim() : '';
                const colTitle = row[1] ? String(row[1]).trim() : '';
                const colDesc = row[2] ? String(row[2]).trim() : '';
                if (colCat) currentCategory = colCat;
                if (colTitle) {
                    currentItem = {
                        key: String(currentIndex++),
                        title: colTitle,
                        description: colDesc || '',
                        categories: currentCategory ? [currentCategory] : []
                    };
                    formattedData.push(currentItem);
                } else if (colDesc && currentItem) {
                    currentItem.description += (currentItem.description ? '\n\n' : '') + colDesc;
                } else if (colDesc && !currentItem) {
                    currentItem = {
                        key: String(currentIndex++),
                        title: 'Untitled',
                        description: colDesc,
                        categories: currentCategory ? [currentCategory] : []
                    };
                    formattedData.push(currentItem);
                }
            });
        }

        dataRef.current = formattedData;
        setPreviewData(formattedData);
        message.success('Parsed ' + formattedData.length + ' records. Click Upload Data to save.');
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

    const payload = items.map((item: any) => ({
      title: item.title || '',
      description: item.description || '',
      categories: item.categories || [],
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
