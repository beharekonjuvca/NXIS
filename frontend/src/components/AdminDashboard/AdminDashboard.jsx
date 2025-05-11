import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  message,
  Spin,
  Progress,
  Typography,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  ClockCircleOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { getPlatformStats } from "../../endpoints";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadStats = async () => {
    try {
      const res = await getPlatformStats();
      setStats(res.data.stats);
    } catch {
      message.error("Failed to load platform statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "2rem auto" }} />
    );
  }

  const { totalUsers, totalNGOs, totalVolunteers, totalPendingNGOs } = stats;

  const cardStyle = {
    borderRadius: 12,
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  const hoverStyle = {
    transform: "scale(1.02)",
  };

  const pendingPercentage = (
    (totalPendingNGOs / (totalNGOs || 1)) *
    100
  ).toFixed(0);

  return (
    <div style={{ padding: "2rem" }}>
      <Card
        hoverable
        style={{
          marginBottom: "2rem",
          background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
          borderRadius: 16,
          color: "#fff",
          textAlign: "center",
        }}
      >
        <Title level={2} style={{ color: "#fff" }}>
          Welcome back, Admin!
        </Title>
        <Text style={{ color: "#fff", fontSize: 16 }}>
          Monitor your platform stats below and take action where needed.
        </Text>
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card
            style={{ ...cardStyle, minHeight: 170, background: "#f0f5ff" }}
            hoverable
            bodyStyle={{ textAlign: "center" }}
            onClick={() => navigate("/admin-dashboard/users")}
          >
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{ ...cardStyle, minHeight: 170, background: "#e6fffb" }}
            hoverable
            bodyStyle={{ textAlign: "center" }}
            onClick={() => navigate("/admin-dashboard/ngos")}
          >
            <Statistic
              title="Total NGOs"
              value={totalNGOs}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{ ...cardStyle, minHeight: 170, background: "#f6ffed" }}
            hoverable
            bodyStyle={{ textAlign: "center" }}
            onClick={() => navigate("/admin-dashboard/volunteers")}
          >
            <Statistic
              title="Total Volunteers"
              value={totalVolunteers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{ ...cardStyle, minHeight: 170, background: "#fffbe6" }}
            hoverable
            bodyStyle={{ textAlign: "center" }}
            onClick={() => navigate("/admin-dashboard/pending-ngos")}
          >
            <Statistic
              title="Pending NGO Approvals"
              value={totalPendingNGOs}
              prefix={<ClockCircleOutlined />}
            />
            <Progress
              percent={parseInt(pendingPercentage)}
              size="small"
              status="active"
              strokeColor="#faad14"
              style={{ marginTop: 12 }}
              showInfo={false}
            />
            <Text type="warning">{pendingPercentage}% of NGOs pending</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
