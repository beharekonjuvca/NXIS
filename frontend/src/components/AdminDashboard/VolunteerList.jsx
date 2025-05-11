import { useEffect, useState } from "react";
import {
  Table,
  Avatar,
  Button,
  Popconfirm,
  Space,
  Typography,
  message,
  Card,
  Tag,
} from "antd";
import { getAllVolunteers, deleteVolunteer } from "../../endpoints";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadVolunteers = async () => {
    setLoading(true);
    try {
      const res = await getAllVolunteers();
      setVolunteers(res.data.volunteers || []);
    } catch {
      message.error("Failed to fetch volunteers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteVolunteer(userId);
      message.success("Volunteer deleted");
      loadVolunteers();
    } catch {
      message.error("Failed to delete volunteer");
    }
  };

  useEffect(() => {
    loadVolunteers();
  }, []);

  const columns = [
    {
      title: "Profile",
      render: (record) => (
        <Space>
          <Avatar
            src={
              record.user?.profilePicture
                ? `http://localhost:5000${record.user.profilePicture}`
                : null
            }
          >
            {!record.user?.profilePicture &&
              record.user?.username?.charAt(0).toUpperCase()}
          </Avatar>

          <span>{record.user?.username}</span>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
    },
    {
      title: "Skills",
      dataIndex: "skills",
      render: (skills) =>
        skills
          ? skills.split(",").map((skill) => <Tag key={skill}>{skill}</Tag>)
          : "-",
    },
    {
      title: "Availability",
      dataIndex: "availability",
      render: (val) => <Tag color="blue">{val || "N/A"}</Tag>,
    },
    {
      title: "Resume",
      dataIndex: "resume",
      render: (resume) =>
        resume ? (
          <a
            href={`http://localhost:5000${resume}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
          </a>
        ) : (
          <em>No Resume</em>
        ),
    },
    {
      title: "Actions",
      render: (record) => (
        <Space>
          <Button
            type="link"
            onClick={() =>
              navigate(`/admin/volunteers/${record.user?.id}/applications`)
            }
          >
            View Applications
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this volunteer?"
            onConfirm={() => handleDelete(record.user?.id)}
          >
            <Button danger type="link">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Button
        type="default"
        onClick={() => navigate("/admin-dashboard")}
        style={{ marginBottom: "1rem" }}
      >
        ← Back to Dashboard
      </Button>

      <Title level={3}>Volunteer Management</Title>
      <Table
        columns={columns}
        dataSource={volunteers}
        rowKey={(record) => record.user?.id}
        loading={loading}
        pagination={{ pageSize: 6 }}
        bordered
      />
    </Card>
  );
};

export default VolunteerList;
