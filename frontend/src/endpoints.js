import axios from "axios";
import { message } from "antd";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      message.error("Session expired. Please log in again.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (formData) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  return response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  return response.json();
};

export const refreshAccessToken = async (token) => {
  const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  return response.json();
};

export const validateToken = async () => {
  return api.get("/auth/validate");
};

export const fetchNgoProfile = async () => {
  return api.get("/ngos/approved");
};

export const getMyNgoProfile = async () => {
  return api.get("/ngos/profile/me");
};

export const updateNgoProfile = async (data) => {
  return api.put("/ngos/update-profile", data);
};

export const uploadProfilePicture = async (formData) => {
  return api.post("/users/upload-profile-picture", formData);
};

export const deleteProfilePicture = async () => {
  return api.delete("/users/delete-profile-picture");
};

export const getAllEvents = async () => {
  return api.get("/events");
};

export const getMyEvents = async () => {
  return api.get("/events/ngo/mine");
};

export const createEvent = async (data) => {
  return api.post("/events", data);
};

export const updateEvent = async (id, data) => {
  return api.put(`/events/${id}`, data);
};

export const deleteEvent = async (id) => {
  return api.delete(`/events/${id}`);
};

export const uploadEventPoster = async (eventId, formData) => {
  return api.post(`/events/${eventId}/upload-poster`, formData);
};

export const rsvpToEvent = async (eventId) => {
  return api.post(`/event-attendees/${eventId}/rsvp`);
};

export const cancelRSVP = async (eventId) => {
  return api.delete(`/event-attendees/${eventId}/cancel`);
};

export const getEventAttendees = async (eventId) => {
  return api.get(`/event-attendees/${eventId}/attendees`);
};

export const removeAttendee = async (attendeeId) => {
  return api.delete(`/event-attendees/${attendeeId}`);
};
export const getPlatformStats = async () => {
  return api.get("/admin/stats");
};

export const getAllUsers = async (queryParams = {}) => {
  const query = new URLSearchParams(queryParams).toString();
  return api.get(`/admin/users?${query}`);
};

export const approveNGO = async (ngoId) => {
  return api.patch(`/admin/approve-ngo/${ngoId}`);
};

export const rejectNGO = async (ngoId) => {
  return api.patch(`/admin/reject-ngo/${ngoId}`);
};

export const deleteUser = async (userId) => {
  return api.delete(`/admin/user/${userId}`);
};
export const getAllNGOs = async (params = {}) => {
  return api.get("/ngos", { params });
};

export const getNGOById = async (ngoId) => {
  return api.get(`/ngos/${ngoId}`);
};

export const deleteNGOProfile = async (ngoId) => {
  return api.delete(`/ngos/${ngoId}`);
};
export const getAllVolunteers = async (params = {}) => {
  return api.get("/volunteers", { params });
};

export const getVolunteerById = async (volunteerId) => {
  return api.get(`/volunteers/getVolunteer/${volunteerId}`);
};

export const getMyVolunteerProfile = async () => {
  return api.get("/volunteers/me");
};

export const updateVolunteerProfile = async (formData) => {
  return api.put("/volunteers/update-profile", formData);
};

export const updateVolunteerEmail = async (data) => {
  return api.put("/volunteers/update-email", data);
};

export const updateVolunteerPassword = async (data) => {
  return api.put("/volunteers/update-password", data);
};

export const uploadVolunteerResume = async (formData) => {
  return api.post("/volunteers/upload-resume", formData);
};

export const deleteVolunteerResume = async () => {
  return api.delete("/volunteers/delete-resume");
};
export const getAllVolunteerApplications = async () => {
  return api.get("/volunteer-applications");
};

export const getMyApplications = async () => {
  return api.get("/volunteer-applications/my-applications");
};

export const applyToOpportunity = async (opportunityId) => {
  return api.post(`/volunteer-applications/${opportunityId}/apply`);
};

export const approveApplication = async (applicationId) => {
  return api.put(`/volunteer-applications/${applicationId}/approve`);
};

export const rejectApplication = async (applicationId) => {
  return api.put(`/volunteer-applications/${applicationId}/reject`);
};

export const assignVolunteerHours = async (applicationId, data) => {
  return api.put(`/volunteer-applications/${applicationId}/assign-hours`, data);
};

export const updateVolunteerHours = async (applicationId, data) => {
  return api.put(`/volunteer-applications/${applicationId}/update-hours`, data);
};

export const deleteApplication = async (applicationId) => {
  return api.delete(`/volunteer-applications/${applicationId}`);
};
export const getAllVolunteerOpportunities = async () => {
  return api.get("/volunteer-opportunities");
};

export const getVolunteerOpportunityById = async (id) => {
  return api.get(`/volunteer-opportunities/${id}`);
};
export const deleteVolunteer = async (userId) => {
  return api.delete(`/admin/user/${userId}`);
};
