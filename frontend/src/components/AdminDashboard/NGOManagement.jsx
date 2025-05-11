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
  getAllNGOs,
  approveNGO,
  rejectNGO,
  deleteNGOProfile,
} from "../../endpoints";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const NGOManagement = () => {
  const [ngos, setNgos] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const loadNGOs = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.name = search;

      const res = await getAllNGOs(params);
      setNgos(res.data.ngos);
    } catch {
      message.error("Failed to fetch NGOs");
    }
  };

  useEffect(() => {
    loadNGOs();
  }, [search, statusFilter]);

  const handleApproval = async (ngoId, action) => {
    try {
      if (action === "approve") await approveNGO(ngoId);
      else await rejectNGO(ngoId);

      message.success(`NGO ${action}d successfully`);
      loadNGOs();
    } catch {
      message.error("Action failed");
    }
  };

  const handleDelete = async (ngoId) => {
    try {
      await deleteNGOProfile(ngoId);
      message.success("NGO deleted");
      loadNGOs();
    } catch {
      message.error("Failed to delete NGO");
    }
  };

  const columns = [
    {
      title: "NGO Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Username",
      dataIndex: ["user", "username"],
      key: "username",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "approved" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      render: (record) => (
        <Space>
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleApproval(record.id, "approve")}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleApproval(record.id, "reject")}
              >
                Reject
              </Button>
            </>
          )}
          <Popconfirm
            title="Are you sure to delete this NGO?"
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
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Back to Dashboard
      </Button>

      <Title level={3}>NGO Management</Title>

      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by NGO name"
          onSearch={(val) => setSearch(val)}
          enterButton
          allowClear
        />
        <Select
          placeholder="Filter by status"
          onChange={(value) => setStatusFilter(value)}
          allowClear
          style={{ width: 200 }}
        >
          <Option value="pending">Pending</Option>
          <Option value="approved">Approved</Option>
          <Option value="rejected">Rejected</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={ngos}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        bordered
      />
    </Card>
  );
};

export default NGOManagement;
