import { Form, Input, Select, Button, Radio, Typography, message } from "antd";
import { useState } from "react";
import { loginUser, registerUser } from "../endpoints";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

const { Title, Text } = Typography;
const { Option } = Select;

const AuthForm = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState("login");
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    password: "",
    role: "volunteer",
    name: "",
    description: "",
    skills: "",
    availability: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleMode = () => {
    setError("");
    setMode(mode === "login" ? "register" : "login");
  };

  const handleChange = (name, value) => {
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async () => {
    setError("");
    if (mode === "login") {
      const res = await loginUser({
        email: formState.email,
        password: formState.password,
      });
      if (res.success) {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        localStorage.setItem("userRole", res.user.role);
        onLoginSuccess();
        navigate("/");
      } else {
        message.error(res.error || "Login failed");
      }
    } else {
      const res = await registerUser(formState);
      if (res.success) {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        localStorage.setItem("userRole", res.user.role);
        onLoginSuccess();
        navigate("/");
      } else {
        message.error(res.error || "Registration failed");
      }
    }
  };

  return (
    <div className="auth-container">
      <Title level={2}>{mode === "login" ? "Login" : "Register"}</Title>

      <Form
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 400, margin: "0 auto" }}
      >
        {mode === "register" && (
          <Form.Item label="Username" required>
            <Input
              value={formState.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />
          </Form.Item>
        )}

        <Form.Item label="Email" required>
          <Input
            type="email"
            value={formState.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Password" required>
          <Input.Password
            value={formState.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </Form.Item>

        {mode === "register" && (
          <>
            <Form.Item label="Select Role">
              <Radio.Group
                onChange={(e) => handleChange("role", e.target.value)}
                value={formState.role}
              >
                <Radio.Button value="volunteer">Volunteer</Radio.Button>
                <Radio.Button value="ngo">NGO</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {formState.role === "ngo" && (
              <>
                <Form.Item label="NGO Name" required>
                  <Input
                    value={formState.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="Description" required>
                  <Input
                    value={formState.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />
                </Form.Item>
              </>
            )}

            {formState.role === "volunteer" && (
              <>
                <Form.Item label="Skills">
                  <Input
                    value={formState.skills}
                    onChange={(e) => handleChange("skills", e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="Availability">
                  <Input
                    value={formState.availability}
                    onChange={(e) =>
                      handleChange("availability", e.target.value)
                    }
                  />
                </Form.Item>
              </>
            )}
          </>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {mode === "login" ? "Login" : "Register"}
          </Button>
        </Form.Item>
      </Form>

      <Text type="secondary">
        {mode === "login"
          ? "Don't have an account?"
          : "Already have an account?"}{" "}
        <span className="auth-toggle" onClick={toggleMode}>
          {mode === "login" ? "Register here" : "Login here"}
        </span>
      </Text>
    </div>
  );
};

export default AuthForm;
