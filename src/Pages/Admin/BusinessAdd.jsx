import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Row,
  Col,
  Divider,
  message,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import baseURL from "../../config";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

/* ================= UI STYLES ================= */
const inputStyle = {
  height: 44,
  borderRadius: 10,
};

const textareaStyle = {
  borderRadius: 10,
};

const sectionTitleStyle = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#0f172a',
  margin: '0 0 16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};
/* ============================================= */

const AddBusiness = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    axios
      .get(`${baseURL}/api/admin/all-subcategory`)
      .then((res) => setSubcategories(res.data))
      .catch(() => message.error("Failed to load subcategories"));
  }, []);

  useEffect(() => {
    axios
      .get(`${baseURL}/api/admin/all-users`)
      .then((res) => setUsers(res.data))
      .catch(() => message.error("Failed to load users"));
  }, []);

  const onFinish = async (values) => {
    setLoading(true);

    let derivedCategoryId = null;
    if (values.subcategories && values.subcategories.length > 0) {
      const firstSubId = values.subcategories[0];
      const selectedSubObj = subcategories.find((s) => s._id === firstSubId);
      if (selectedSubObj && selectedSubObj.parentCategory) {
        derivedCategoryId = selectedSubObj.parentCategory._id;
      }
    }

    if (!derivedCategoryId) {
      message.error("Please select a subcategory to determine the main category.");
      setLoading(false);
      return;
    }

    const timings = {};
    days.forEach((day) => {
      const val = values[day];
      timings[day] = {
        open: val?.open || null,
        close: val?.close || null,
        closed: val?.closed || false,
      };
    });

    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (!["services", "subcategories"].includes(key)) {
        formData.append(key, values[key]);
      }
    });

    formData.append("category", derivedCategoryId);
    (values.subcategories || []).forEach((id) => formData.append("subcategories", id));
    (values.services || []).forEach((s) => formData.append("services", s));

    formData.append("timings", JSON.stringify(timings));
    fileList.forEach((file) => formData.append("images", file));

    try {
      await axios.post(`${baseURL}/api/admin/add-business`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Business added successfully!");
      navigate("/admin/business-list");
    } catch (err) {
      console.error(err);
      message.error("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            padding: '24px 28px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Add New Business
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '4px 0 0' }}>
            Fill in the details to register a new business
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px' }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <h3 style={sectionTitleStyle}>
              <span style={{ width: '3px', height: '16px', background: '#6366f1', borderRadius: '2px', display: 'inline-block' }} />
              Business Details
            </h3>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Select User"
                  name="userId"
                  rules={[{ required: true }]}
                >
                  <Select
                    size="large"
                    placeholder="Select User"
                    showSearch
                    optionFilterProp="label"
                    style={{ borderRadius: 10 }}
                    options={users.map((u) => ({
                      label: `${u.name || "No Name"} (${u.mobileno})`,
                      value: u._id,
                    }))}
                    onChange={(value) => {
                      const selectedUser = users.find((u) => u._id === value);
                      if (selectedUser) {
                        form.setFieldsValue({
                          ownerName: selectedUser.name,
                          mobile: selectedUser.mobileno,
                        });
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Business Name" name="businessName" rules={[{ required: true }]}>
                  <Input style={inputStyle} placeholder="Enter Business Name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Owner Name" name="ownerName" rules={[{ required: true }]}>
                  <Input style={inputStyle} placeholder="Enter Owner Name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Sub Category" name="subcategories" rules={[{ required: true, message: 'Please select at least one subcategory' }]}>
                  <Select
                    mode="multiple"
                    size="large"
                    placeholder="Select Sub Categories"
                    style={{ borderRadius: 10 }}
                    options={subcategories.map((s) => ({ label: s.name, value: s._id }))}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Mobile Number" name="mobile" rules={[{ required: true }]}>
                  <Input style={inputStyle} placeholder="Enter Mobile Number" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="City" name="city" rules={[{ required: true }]}>
                  <Input style={inputStyle} placeholder="Enter City Name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Pincode" name="pincode">
                  <Input style={inputStyle} placeholder="Enter Pincode" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Location URL" name="locationUrl">
                  <Input style={inputStyle} placeholder="Google Map Link" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                  <Input.TextArea rows={3} style={textareaStyle} />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item label="Description" name="description">
                  <Input.TextArea rows={4} style={textareaStyle} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Business Images">
                  <Upload
                    listType="picture"
                    beforeUpload={(file) => {
                      setFileList((prev) => [...prev, file]);
                      return false;
                    }}
                    onRemove={(file) =>
                      setFileList((prev) => prev.filter((f) => f.uid !== file.uid))
                    }
                  >
                    <Button size="large" icon={<UploadOutlined />} style={{ borderRadius: 10 }}>
                      Select Images
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ borderColor: '#f1f5f9' }} />

            <h3 style={sectionTitleStyle}>
              <span style={{ width: '3px', height: '16px', background: '#10b981', borderRadius: '2px', display: 'inline-block' }} />
              Services
            </h3>
            <Form.List name="services">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Row key={field.key} gutter={12}>
                      <Col span={20}>
                        <Form.Item {...field} rules={[{ required: true }]}>
                          <Input style={inputStyle} placeholder="Enter Service" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Button danger block onClick={() => remove(field.name)} style={{ borderRadius: 8, height: 44 }}>
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Button type="dashed" block onClick={() => add()} style={{ borderRadius: 10, height: 44 }}>
                    + Add Service
                  </Button>
                </>
              )}
            </Form.List>

            <Divider style={{ borderColor: '#f1f5f9' }} />

            <h3 style={sectionTitleStyle}>
              <span style={{ width: '3px', height: '16px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }} />
              Business Timings
            </h3>
            {days.map((day) => (
              <Row key={day} gutter={12} align="middle" style={{ marginBottom: '4px' }}>
                <Col span={6} style={{ textTransform: 'capitalize', fontWeight: 500, color: '#334155', fontSize: '13.5px' }}>{day}</Col>
                <Col span={6}><Form.Item name={[day, "open"]}><Input type="time" style={{ borderRadius: 8 }} /></Form.Item></Col>
                <Col span={6}><Form.Item name={[day, "close"]}><Input type="time" style={{ borderRadius: 8 }} /></Form.Item></Col>
                <Col span={6}><Form.Item name={[day, "closed"]} valuePropName="checked"><Checkbox>Closed</Checkbox></Form.Item></Col>
              </Row>
            ))}

            <Divider style={{ borderColor: '#f1f5f9' }} />

            <h3 style={sectionTitleStyle}>
              <span style={{ width: '3px', height: '16px', background: '#6366f1', borderRadius: '2px', display: 'inline-block' }} />
              Paid Promotion
            </h3>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="isPaid" valuePropName="checked"><Checkbox>Enable Paid</Checkbox></Form.Item></Col>
              <Col span={8}><Form.Item name="paidAmount"><Input style={inputStyle} type="number" placeholder="Amount ₹" /></Form.Item></Col>
              <Col span={8}><Form.Item name="paidDays"><Input style={inputStyle} type="number" placeholder="Days" /></Form.Item></Col>
            </Row>

            <Divider style={{ borderColor: '#f1f5f9' }} />

            <Button
              htmlType="submit"
              type="primary"
              loading={loading}
              size="large"
              style={{
                width: "100%",
                height: 48,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                borderRadius: 10,
                fontWeight: 600,
                border: "none",
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              }}
            >
              Add Business
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddBusiness;
