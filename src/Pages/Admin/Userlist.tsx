import React, { useEffect, useState } from "react";
import { Table, Avatar, Tag } from "antd";
import axios from "axios";
import moment from "moment";
import baseURL from "../../config";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/api/admin/all-users`);
        let userdata = res.data.reverse();
      setUsers(userdata);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => text || <Tag color="orange">Not Updated</Tag>,
    },
    {
      title: "Mobile",
      dataIndex: "mobileno",
      key: "mobileno",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text: string) => text || "-",
    },
    {
      title: "Pincode",
      dataIndex: "pincode",
      key: "pincode",
      render: (text: string) => text || "-",
    },
    {
      title: "Joined On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        moment(date).format("DD MMM YYYY"),
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Users</h2>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
};

export default UserList;
