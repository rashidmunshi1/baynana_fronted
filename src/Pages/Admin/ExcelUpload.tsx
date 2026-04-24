import React, { useState, useEffect, useRef } from 'react';
import { Upload, Button, message, Table, Card, Typography } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';
import baseURL from '../../config';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ExcelUpload: React.FC = () => {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [storedData, setStoredData] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dataRef = useRef<any[]>([]);

  const fetchStoredData = () => {
    setFetching(true);
    axios.get(`${baseURL}/api/admin/excel-data`)
      .then((response) => {
        if (response.data.success && response.data.data) {
          const formatted = response.data.data.map((item: any, i: number) => ({
            ...item,
            key: item._id || String(i),
          }));
          setStoredData(formatted);
        }
      })
      .catch((err) => {
        console.error("Fetch stored data error:", err);
      })
      .finally(() => {
        setFetching(false);
      });
  };

  useEffect(() => {
    fetchStoredData();
  }, []);

  const columns = [
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
        if (Array.isArray(val)) return val.join(', ');
        return String(val);
      },
    },
  ];

  const handleFileUpload = (file: File) => {
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

  return (
    <>
      <div style={{ padding: '24px', background: '#fff', minHeight: 'calc(100vh - 120px)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#1e293b' }}>
              Excel Upload
            </Title>
            <Text style={{ color: '#64748b' }}>Upload bulk data entries via Excel (.xlsx, .csv)</Text>
          </div>
        </div>

        <Card style={{ marginBottom: '24px' }}>
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
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
              <p>Required columns: Title, Description, Category (comma separated for multiple)</p>
            </div>
          </Dragger>
        </Card>

        {previewData.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={5} style={{ margin: 0 }}>Preview Data ({previewData.length} records)</Title>
              <button
                disabled={uploading}
                style={{
                  padding: '10px 24px',
                  backgroundColor: uploading ? '#94a3b8' : '#1677ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
                onClick={() => {
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

                  fetch(`${baseURL}/api/admin/excel-data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: payload }),
                  })
                    .then(res => res.json())
                    .then(result => {
                      if (result.success) {
                        message.success('Successfully uploaded ' + result.count + ' records!');
                        dataRef.current = [];
                        setPreviewData([]);
                        fetchStoredData();
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
                }}
              >
                {uploading ? 'Uploading...' : `Upload Data (${previewData.length} records)`}
              </button>
            </div>
            <Table 
              dataSource={previewData} 
              columns={columns} 
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
              bordered
              size="middle"
            />
          </div>
        )}

        <div style={{ marginTop: '40px' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>Stored Data ({storedData.length})</Title>
          <Table 
            dataSource={storedData} 
            columns={columns} 
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
            bordered
            size="middle"
            loading={fetching}
          />
        </div>
      </div>
    </>
  );
};

export default ExcelUpload;
