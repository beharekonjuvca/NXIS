import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Avatar,
  Upload,
  message,
  Typography,
  Space,
} from "antd";
import {
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  getMyNgoProfile,
  updateNgoProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} from "../../endpoints";

const { Title, Paragraph, Text } = Typography;

const NgoProfile = () => {
  const [form] = Form.useForm();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await getMyNgoProfile();
      const profileData = res.data.ngo;

      if (profileData) {
        setProfile(profileData);
        form.setFieldsValue(profileData);
      }
    } catch {
      message.error("Failed to load profile.");
    }
  };

  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      await updateNgoProfile(values);
      message.success("Profile updated!");
      setEditing(false);
      loadProfile();
    } catch {
      message.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    try {
      setUploading(true);
      await uploadProfilePicture(formData);
      message.success("Profile picture uploaded!");
      loadProfile();
    } catch {
      message.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    try {
      await deleteProfilePicture();
      message.success("Profile picture removed!");
      loadProfile();
    } catch {
      message.error("Failed to delete picture.");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (!profile) return null;

  return (
    <Card
      title="NGO Profile"
      extra={
        !editing ? (
          <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
            Edit
          </Button>
        ) : null
      }
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Avatar
            size={96}
            src={
              profile.user.profilePicture
                ? `http://localhost:5000${profile.user.profilePicture}`
                : null
            }
            style={{
              backgroundColor: "#1890ff",
              fontSize: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!profile.user.profilePicture &&
              profile.user.username?.charAt(0).toUpperCase()}
          </Avatar>

          <Upload
            customRequest={handleUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              Upload Logo
            </Button>
          </Upload>
          {profile.user.profilePicture && (
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={handleDeletePicture}
            >
              Remove
            </Button>
          )}
        </div>
        {editing ? (
          <Form layout="vertical" form={form} onFinish={handleUpdate}>
            <Form.Item
              label="NGO Name"
              name="name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Save Changes
            </Button>
          </Form>
        ) : (
          <div>
            <Title level={4}>{profile.name}</Title>
            <Paragraph>{profile.description}</Paragraph>
            <Text strong>Email:</Text> <Text>{profile.user.email}</Text>
            <br />
            <Text strong>Username:</Text> <Text>{profile.user.username}</Text>
          </div>
        )}
        <Text>
          <Text strong>Status: </Text>
          <Text
            type={
              profile.status === "approved"
                ? "success"
                : profile.status === "pending"
                ? "warning"
                : "danger"
            }
          >
            {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
          </Text>
        </Text>
      </Space>
    </Card>
  );
};

export default NgoProfile;
