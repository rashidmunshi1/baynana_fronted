import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Card,
  Divider,
  message,
  Checkbox,
} from "antd";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import baseURL from "../../config";

/* ================= UI STYLES ================= */
const inputStyle = {
  height: 44,
  borderRadius: 8,
};

const textareaStyle = {
  borderRadius: 8,
};

const cardStyle = {
  borderRadius: 14,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};
/* ============================================= */

const UpdateBusiness = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${baseURL}/api/admin/business/${id}`)
      .then((res) => {
        const data = res.data;

        form.setFieldsValue({
          businessName: data.businessName,
          ownerName: data.ownerName,
          mobile: data.mobile,
          city: data.city,
          pincode: data.pincode,
          locationUrl: data.locationUrl,
          address: data.address,
          description: data.description,
          services: data.services || [],
          isPaid: data.isPaid,
          paidAmount: data.paidAmount,
          paidDays: data.paidDays,
        });
      })
      .catch(() => message.error("Failed to load business data"));
  }, [id, form]);

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      await axios.put(`${baseURL}/api/admin/update-business/${id}`, values);
      message.success("Business updated successfully!");
      navigate("/admin/business-list");
    } catch {
      message.error("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <Card bordered={false} style={cardStyle}>
      <h2 className="text-xl font-bold mb-2">✏ Update Business</h2>
      <Divider />

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Business Details */}
        <h3 className="font-semibold text-gray-700 mb-3">🧾 Business Details</h3>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Business Name"
              name="businessName"
              rules={[{ required: true }]}
            >
              <Input style={inputStyle} placeholder="Enter Business Name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Owner Name"
              name="ownerName"
              rules={[{ required: true }]}
            >
              <Input style={inputStyle} placeholder="Enter Owner Name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Mobile Number"
              name="mobile"
              rules={[{ required: true }]}
            >
              <Input style={inputStyle} placeholder="Enter Mobile Number" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="City"
              name="city"
              rules={[{ required: true }]}
            >
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
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true }]}
            >
              <Input.TextArea
                rows={3}
                style={textareaStyle}
                placeholder="Enter Business Address"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Description" name="description">
              <Input.TextArea
                rows={4}
                style={textareaStyle}
                placeholder="Business Description"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* Services */}
        <h3 className="font-semibold text-gray-700 mb-3">🔧 Services</h3>
        <Form.List name="services">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Row key={field.key} gutter={12} align="middle">
                  <Col span={20}>
                    <Form.Item {...field} rules={[{ required: true }]}>
                      <Input
                        style={inputStyle}
                        placeholder="Enter Service"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Button danger block onClick={() => remove(field.name)}>
                      Remove
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button type="dashed" block onClick={() => add()}>
                + Add Service
              </Button>
            </>
          )}
        </Form.List>

        <Divider />

        {/* Paid Promotion */}
        <h3 className="font-semibold text-gray-700 mb-3">💰 Paid Promotion</h3>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="isPaid" valuePropName="checked">
              <Checkbox>Enable Paid Promotion</Checkbox>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Amount" name="paidAmount">
              <Input
                style={inputStyle}
                type="number"
                placeholder="Amount ₹"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Days" name="paidDays">
              <Input
                style={inputStyle}
                type="number"
                placeholder="Validity Days"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Button
          htmlType="submit"
          type="primary"
          size="large"
          loading={loading}
          style={{
            width: "100%",
            height: 48,
            background: "#7C3AED",
            borderRadius: 10,
            fontWeight: 600,
            border: "none",
          }}
        >
          Update Business
        </Button>
      </Form>
    </Card>
  );
};

export default UpdateBusiness;
