import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import NgoProfile from "./NgoProfile";
import NgoEvents from "./NgoEvents";
import EventAttendees from "./EventAttendees";
import { useNavigate } from "react-router-dom";

const { Sider, Content, Header } = Layout;

const NgoDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState("profile");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/auth");
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "profile":
        return <NgoProfile />;
      case "events":
        return <NgoEvents />;
      case "attendees":
        return <EventAttendees />;
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light">
        <div className="logo" style={{ padding: "1rem", fontWeight: "bold" }}>
          NXIS NGO
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["profile"]}
          onClick={({ key }) => setSelectedMenu(key)}
          items={[
            { key: "profile", icon: <UserOutlined />, label: "Profile" },
            { key: "events", icon: <CalendarOutlined />, label: "My Events" },
            { key: "attendees", icon: <TeamOutlined />, label: "Attendees" },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>NGO Dashboard - {selectedMenu.toUpperCase()}</div>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            type="primary"
            danger
          >
            Logout
          </Button>
        </Header>
        <Content style={{ padding: "2rem" }}>{renderContent()}</Content>
      </Layout>
    </Layout>
  );
};

export default NgoDashboard;
