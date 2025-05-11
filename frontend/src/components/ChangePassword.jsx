import { Form, Input, Button, Card, message } from "antd";
import { updateVolunteerPassword } from "../endpoints";

const ChangePassword = () => {
  const onFinish = async (values) => {
    try {
      await updateVolunteerPassword(values);
      message.success("Password updated successfully.");
    } catch {
      message.error("Failed to update password.");
    }
  };

  return (
    <Card
      title="Change Password"
      style={{ maxWidth: 400, margin: "2rem auto" }}
    >
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: "Please enter a new password." }]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Update Password
        </Button>
      </Form>
    </Card>
  );
};

export default ChangePassword;
