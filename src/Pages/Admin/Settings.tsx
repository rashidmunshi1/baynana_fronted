import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Spin, message, Row, Col, InputNumber } from 'antd';
import axios from 'axios';
import baseURL from '../../config';

const { Option } = Select;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/api/admin/settings`);
      form.setFieldsValue(res.data);
    } catch (error) {
      console.error("Failed to fetch settings", error);
      message.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setSaving(true);
      await axios.put(`${baseURL}/api/admin/settings`, values);
      message.success("Settings updated successfully!");
    } catch (error) {
      console.error("Failed to update settings", error);
      message.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Spin size="large" /></div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Global Settings</h2>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Card title="WhatsApp (Meta API) Credentials" className="shadow-sm border-gray-200">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                label="Phone Number ID" 
                name="whatsappPhoneNumberId"
              >
                <Input placeholder="e.g. 1183405551524394" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item 
                label="Access Token" 
                name="whatsappAccessToken"
              >
                <Input.Password placeholder="Meta App Access Token" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item 
                label="Template Name" 
                name="whatsappTemplateName"
              >
                <Input placeholder="e.g. your_otp_template" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item 
                label="Template Language" 
                name="whatsappTemplateLang"
              >
                <Input placeholder="e.g. en_US" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item 
                label="Template Parameters Count" 
                name="whatsappTemplateParamsCount"
                extra="How many text parameters does the template expect? (Default is 1 for OTP)"
              >
                <InputNumber min={1} max={10} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="primary" htmlType="submit" loading={saving} size="large" className="bg-[#1f2937] hover:bg-[#374151]">
            Save Settings
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Settings;
