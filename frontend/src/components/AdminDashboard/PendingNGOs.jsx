import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Tag,
  Space,
  message,
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

const PendingNGOs = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadPendingNGOs = async () => {
    setLoading(true);
    try {
      const res = await getAllNGOs();
      const pending =
        res.data.ngos?.filter((ngo) => ngo.status === "pending") || [];
      setNgos(pending);
    } catch {
      message.error("Failed to fetch NGOs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingNGOs();
  }, []);

  const handleApprove = async (ngoId) => {
    try {
      await approveNGO(ngoId);
      message.success("NGO approved");
      loadPendingNGOs();
    } catch {
      message.error("Approval failed");
    }
  };

  const handleReject = async (ngoId) => {
    try {
      await rejectNGO(ngoId);
      message.success("NGO rejected");
      loadPendingNGOs();
    } catch {
      message.error("Rejection failed");
    }
  };

  const handleDelete = async (ngoId) => {
    try {
      await deleteNGOProfile(ngoId);
      message.success("NGO deleted");
      loadPendingNGOs();
    } catch {
      message.error("Deletion failed");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "pending" ? "orange" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      render: (record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => handleApprove(record.id)}
            size="small"
          >
            Approve
          </Button>
          <Button danger onClick={() => handleReject(record.id)} size="small">
            Reject
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this NGO?"
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
    <Card>
      <Title level={3}>Pending NGO Approvals</Title>
      <Button
        type="default"
        style={{ marginBottom: 16 }}
        onClick={() => navigate("/admin-dashboard")}
      >
        ← Back to Dashboard
      </Button>

      <Table
        columns={columns}
        dataSource={ngos}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        bordered
      />
    </Card>
  );
};

export default PendingNGOs;
