import { Dropdown, Menu, Avatar, Space } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.png";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    if (key === "logout") onLogout();
    if (key === "changePassword") navigate("/change-password"); // Add this route
    if (key === "profile") navigate("/profile"); // Optional
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="changePassword" icon={<SettingOutlined />}>
        Change Password
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="nxis-header">
      <div className="nxis-header-content">
        <img src={logo} alt="NXIS Logo" className="nxis-logo" />
        <h1 className="nxis-title">NXIS</h1>
      </div>
      <div style={{ marginRight: "1rem" }}>
        <Dropdown overlay={menu} placement="bottomRight">
          <Space style={{ cursor: "pointer" }}>
            <Avatar icon={<UserOutlined />} />
          </Space>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
