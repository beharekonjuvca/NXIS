import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  message,
  Button,
  Popconfirm,
  Spin,
  Empty,
  Typography,
} from "antd";
import {
  getMyEvents,
  getEventAttendees,
  removeAttendee,
} from "../../endpoints";

const { Option } = Select;
const { Text } = Typography;

const EventAttendees = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await getMyEvents();
      const ngoEvents = res.data?.events || [];
      setEvents(ngoEvents);
      if (ngoEvents.length > 0) {
        setSelectedEventId(ngoEvents[0].id);
      }
    } catch {
      message.error("Failed to load events");
      setEvents([]);
    }
  };

  const fetchAttendees = async (eventId) => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await getEventAttendees(eventId);
      setAttendees(res.data?.attendees || []);
    } catch {
      message.error("Failed to load attendees");
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (attendeeId) => {
    try {
      await removeAttendee(attendeeId);
      message.success("Attendee removed");
      fetchAttendees(selectedEventId);
    } catch {
      message.error("Failed to remove attendee");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) fetchAttendees(selectedEventId);
  }, [selectedEventId]);

  const columns = [
    { title: "Username", dataIndex: ["volunteer", "username"] },
    { title: "Email", dataIndex: ["volunteer", "email"] },
    {
      title: "Actions",
      render: (_, record) => (
        <Popconfirm
          title="Remove this attendee?"
          onConfirm={() => handleRemove(record.id)}
        >
          <Button danger type="link">
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card title="Event Attendees">
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 400 }}
          value={selectedEventId}
          onChange={setSelectedEventId}
          placeholder="Select an event"
          optionLabelProp="label"
        >
          {Array.isArray(events) &&
            events.map((event) => (
              <Option
                key={event.id}
                value={event.id}
                label={`${event.title} - ${event.location}`}
              >
                <div>
                  <strong>{event.title}</strong>{" "}
                  <span style={{ color: "#888", fontSize: 12 }}>
                    | {event.location} ·{" "}
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
              </Option>
            ))}
        </Select>
      </div>

      {loading ? (
        <Spin />
      ) : attendees.length === 0 ? (
        <Empty description="No attendees for this event yet." />
      ) : (
        <>
          <Text style={{ display: "block", marginBottom: 8 }}>
            🧍‍♂️ <strong>{attendees.length}</strong> attendee(s) registered
          </Text>
          <Table
            columns={columns}
            dataSource={attendees}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            bordered
          />
        </>
      )}
    </Card>
  );
};

export default EventAttendees;
