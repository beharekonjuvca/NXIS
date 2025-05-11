import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Card, Typography, Tag, message, Button, Space } from "antd";
import { getVolunteerById, getAllVolunteerApplications } from "../../endpoints";

const { Title } = Typography;

const VolunteerApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userRes, appsRes] = await Promise.all([
        getVolunteerById(id),
        getAllVolunteerApplications(),
      ]);

      const filteredApps = appsRes.data.applications.filter(
        (app) => app.volunteerId === parseInt(id)
      );

      setVolunteer(userRes.data.volunteer);
      setApplications(filteredApps);
    } catch {
      message.error("Failed to load volunteer applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const columns = [
    {
      title: "Opportunity",
      dataIndex: ["opportunity", "title"],
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const color =
          {
            pending: "orange",
            approved: "green",
            rejected: "red",
          }[status] || "default";

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Assigned Hours",
      dataIndex: "assignedHours",
      render: (val) => val ?? "N/A",
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "N/A"),
    },
  ];

  return (
    <Card
      loading={loading}
      title={
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            Applications of {volunteer?.user?.username}
          </Title>
          <Button onClick={() => navigate(-1)}>← Back</Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={applications}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
      />
    </Card>
  );
};

export default VolunteerApplications;
