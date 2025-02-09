import { Card, Row, Table, Col, Input, message, Spin, Modal } from "antd";
import { AiFillDelete } from "react-icons/ai";
import { RiAddBoxFill } from "react-icons/ri";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

interface Category {
  id: string;
  name: string;
}

const dummyData: Category[] = [
  { id: "1", name: "Electronics" },
  { id: "2", name: "Fashion" },
  { id: "3", name: "Home & Kitchen" },
  { id: "4", name: "Books" },
  { id: "5", name: "Sports" },
];

export const CategoryTable = () => {
  const [dataSource, setDataSource] = useState<Category[]>(dummyData);
  const [searchText, setSearchText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredCategories = dataSource.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteId) {
      setDataSource(dataSource.filter((item) => item.id !== deleteId));
      message.success("Category deleted successfully");
      setDeleteId(null);
    }
  };

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      render: (text: string) => text || "-",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: Category) => (
        <div className="d-flex">
          <EditOutlined
            className="me-4 text-yellow"
            style={{ fontSize: "20px", cursor: "pointer" }}
          />
          <AiFillDelete
            className="text-red-500"
            style={{ fontSize: "20px", cursor: "pointer" }}
            onClick={() => setDeleteId(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Row className="m-2" align="middle" justify={"space-between"}>
        <Col md={9} xl={6} className="font-bold">
          <h2 className="text-2xl">Category</h2>
        </Col>
        <Col md={24} xl={12}>
          
              <Input
                prefix={<SearchOutlined style={{ color: "#a6a6a6" }} />}
                size="large"
                placeholder="Search..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
        </Col>
      </Row>
      <Row>
        <Card className="w-full">
          <Col xl={24}>
            <Spin spinning={false}>
              <Table columns={columns} dataSource={filteredCategories} rowKey="id" />
            </Spin>
          </Col>
        </Card>
      </Row>
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
