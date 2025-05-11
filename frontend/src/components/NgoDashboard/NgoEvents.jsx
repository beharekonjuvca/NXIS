import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  Card,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  uploadEventPoster,
} from "../../endpoints";
import { EyeOutlined } from "@ant-design/icons";

const NgoEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [selectedPreview, setSelectedPreview] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getMyEvents();
      setEvents(res.data.events);
    } catch {
      message.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      const payload = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
      };

      let event;
      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
        event = { id: editingEvent.id };
        message.success("Event updated");
      } else {
        const res = await createEvent(payload);
        event = res.data.event;
        message.success("Event created");
      }

      if (fileList.length && event.id) {
        const formData = new FormData();
        formData.append("posterImage", fileList[0].originFileObj);
        await uploadEventPoster(event.id, formData);
        message.success("Poster uploaded");
      }

      setModalVisible(false);
      setEditingEvent(null);
      setFileList([]);
      form.resetFields();
      fetchEvents();
    } catch {
      message.error("Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      message.success("Event deleted");
      fetchEvents();
    } catch {
      message.error("Failed to delete event");
    }
  };

  const columns = [
    { title: "Title", dataIndex: "title" },
    { title: "Location", dataIndex: "location" },
    { title: "Date", dataIndex: "date" },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button
            icon={<EyeOutlined />}
            onClick={() => setSelectedPreview(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            type="link"
            onClick={() => {
              setEditingEvent(record);
              form.setFieldsValue({
                ...record,
                date: dayjs(record.date),
              });
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger type="link">
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <Card
      title="Manage Your Events"
      extra={<Button onClick={() => setModalVisible(true)}>Add Event</Button>}
    >
      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        loading={loading}
      />
      <Modal
        open={!!selectedPreview}
        onCancel={() => setSelectedPreview(null)}
        footer={null}
        centered
        width={600}
      >
        {selectedPreview && (
          <Card
            cover={
              selectedPreview.posterImage && (
                <img
                  src={`http://localhost:5000${selectedPreview.posterImage}`}
                  alt="Event Poster"
                  style={{ maxHeight: 300, marginTop: 30, objectFit: "cover" }}
                />
              )
            }
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              background: "#fdfdfd",
            }}
          >
            <h2 style={{ marginBottom: 0 }}>{selectedPreview.title}</h2>
            <p style={{ color: "#555", fontSize: 16 }}>
              {selectedPreview.description}
            </p>
            <div style={{ marginTop: 12 }}>
              <strong>📍 Location:</strong> {selectedPreview.location}
            </div>
            <div style={{ marginTop: 4 }}>
              <strong>📅 Date:</strong>{" "}
              {dayjs(selectedPreview.date).format("MMMM D, YYYY")}
            </div>
          </Card>
        )}
      </Modal>

      <Modal
        title={editingEvent ? "Edit Event" : "Create Event"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingEvent(null);
          setFileList([]);
        }}
        onOk={() => form.submit()}
        okText={editingEvent ? "Update" : "Create"}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateOrUpdate}>
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Date" name="date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          {!editingEvent && (
            <Form.Item label="Poster Image">
              <Upload
                beforeUpload={() => false}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
              >
                <Button icon={<UploadOutlined />}>Select Image</Button>
              </Upload>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default NgoEvents;
