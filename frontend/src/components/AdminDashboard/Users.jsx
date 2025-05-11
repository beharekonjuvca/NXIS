import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  message,
  Button,
  Popconfirm,
  Space,
  Tag,
  Typography,
  Card,
} from "antd";
import {
  getAllUsers,
  deleteUser,
  approveNGO,
  rejectNGO,
} from "../../endpoints";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      const res = await getAllUsers({
        search,
        role: roleFilter,
      });
      setUsers(res.data.users);
    } catch {
      message.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      message.success("User deleted");
      loadUsers();
    } catch {
      message.error("Failed to delete user");
    }
  };

  const handleApproval = async (ngoId, action) => {
    try {
      if (action === "approve") await approveNGO(ngoId);
      else await rejectNGO(ngoId);

      message.success(`NGO ${action}d successfully`);
      loadUsers();
    } catch {
      message.error("Action failed");
    }
  };

  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag>{role}</Tag>,
    },
    {
      title: "Status",
      render: (record) => {
        if (record.role === "ngo") {
          const status = record.ngoProfile?.status;
          return (
            <Tag color={status === "approved" ? "green" : "orange"}>
              {status}
            </Tag>
          );
        }
        return "-";
      },
    },
    {
      title: "Actions",
      render: (record) => (
        <Space>
          {record.role === "ngo" && record.ngoProfile?.status === "pending" && (
            <>
              <Button
                onClick={() => handleApproval(record.ngoProfile.id, "approve")}
                type="primary"
                size="small"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleApproval(record.ngoProfile.id, "reject")}
                danger
                size="small"
              >
                Reject
              </Button>
            </>
          )}
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ padding: 24 }}>
      <Button
        onClick={() => navigate("/admin-dashboard")}
        style={{ marginBottom: 16 }}
      >
        ← Back to Dashboard
      </Button>

      <Title level={3}>User Management</Title>

      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by username or email"
          onSearch={(val) => setSearch(val)}
          enterButton
          allowClear
        />
        <Select
          placeholder="Filter by role"
          onChange={(value) => setRoleFilter(value)}
          allowClear
          style={{ width: 200 }}
        >
          <Option value="admin">Admin</Option>
          <Option value="ngo">NGO</Option>
          <Option value="volunteer">Volunteer</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        bordered
      />
    </Card>
  );
};

export default Users;
