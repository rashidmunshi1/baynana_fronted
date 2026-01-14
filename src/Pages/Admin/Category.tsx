import { Card, Row, Table, Col, Input, message, Spin, Modal, Button, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";
import baseURL from "../../config";

interface ParentCategory {
  _id: string;
  name: string;
  image: string | null;
}

export interface Category {
  _id: string;
  name: string;
  image: string | null;
  parentCategory: ParentCategory | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  orderPriority: number;
  slug: string;
  description: string;
}

export const CategoryTable = () => {
  const [dataSource, setDataSource] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();



  // ------------------ FETCH API --------------------
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Category[]>(`${baseURL}/api/admin/all-category`);
      setDataSource(res.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ------------------ DELETE --------------------
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // API call to delete (optional, uncomment if needed)
      // await axios.delete(`${baseURL}/api/admin/delete-category/${deleteId}`);

      setDataSource((prev) => prev.filter((item) => item._id !== deleteId));
      message.success("Category deleted successfully");
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      message.error("Error deleting category");
    }
  };

  // ------------------ SEARCH --------------------
  const filteredCategories = dataSource.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // ------------------ TABLE COLUMNS --------------------
  const columns: ColumnsType<Category> = [
    {
      title: "Category Name",
      dataIndex: "name",
    },
    {
      title: "Image",
      dataIndex: "image",
      render: (text) => {
        if (text) {
          // Ensure correct path to uploads/category/
          const imageUrl = `${baseURL}/uploads/category/${text}`;
          return (
            <img
              src={imageUrl}
              alt="Category"
              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/80?text=Error";
              }}
            />
          );
        }
        return <span style={{ color: '#ccc' }}>No Image</span>;
      },
    },
    {
      title: "Slug",
      dataIndex: "slug",
    },
    {
      title: "Description",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status === "Active" ? "Active" : "Inactive"}</Tag>
      ),
    },
    {
      title: "Order",
      dataIndex: "orderPriority",
      render: (orderPriority: number) => (
        <Tag color="blue">{orderPriority}</Tag>
      ),
    },
  ];

  // ------------------ RETURN --------------------
  return (
    <div>
      {/* Header Row */}
      <Row className="m-2" align="middle" justify="space-between" style={{ marginBottom: 20 }}>
        <Col xs={24} md={8} xl={6} className="font-bold">
          <h2 className="text-2xl">Category List</h2>
        </Col>

        <Col xs={24} md={12} xl={12}>
          <Input
            prefix={<SearchOutlined style={{ color: "#a6a6a6" }} />}
            size="large"
            placeholder="Search categories..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>

        <Col xs={24} md={4} xl={6} className="flex justify-end">
          <Button
            size="large"
            onClick={() => navigate("/admin/categorys/add")}
            style={{
              background: "#7C3AED",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              marginLeft: '10px'
            }}
          >
            + Add Category
          </Button>
        </Col>
      </Row>

      {/* Table */}
      <Row>
        <Card className="w-full" bodyStyle={{ padding: 0 }}>
          <Col xl={24}>
            <Spin spinning={loading}>
              <Table<Category>
                columns={columns}
                dataSource={filteredCategories}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
              />
            </Spin>
          </Col>
        </Card>
      </Row>

      {/* Delete Modal */}
      <Modal
        title="Confirmation"
        open={!!deleteId}
        onOk={handleDelete}
        onCancel={() => setDeleteId(null)}
        okText="Yes"
        cancelText="No"
      >
        <p>Are you sure you want to delete this category?</p>
      </Modal>
    </div>
  );
};
