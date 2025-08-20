// src/services/bookingService.js
import axiosInstance from "../utils/axiosInstance";

// ---------------- Locations ----------------
export const fetchLocations = async () => {
  const res = await axiosInstance.get("/locations");
  return res.data;
};

// ---------------- Specialties ----------------
export const fetchSpecialties = async () => {
  const res = await axiosInstance.get("/specialties");
  return res.data;
};

// ---------------- Doctors ----------------
export const fetchDoctors = async (locationId, specialtyId) => {
  const res = await axiosInstance.get("/doctors", {
    params: { locationId, specialtyId },
  });
  return res.data;
};

// ---------------- Slots ----------------
export const getAvailableSlots = async (doctorId, date) => {
  const res = await axiosInstance.get(`/appointments/available-slots`, {
    params: { doctorId, date },
  });
  return res.data;
};

// ---------------- Appointment (patient) ----------------
export const createAppointment = async (payload) => {
  const res = await axiosInstance.post("/appointments", payload);
  return res.data;
};

export const fetchAppointments = async () => {
  const res = await axiosInstance.get("/appointments");
  return res.data;
};

export const cancelAppointment = async (id) => {
  const res = await axiosInstance.delete(`/appointments/${id}`);
  return res.data;
};

// ---------------- OTP ----------------
export const verifyOtp = async (appointmentId, otp) => {
  const res = await axiosInstance.post(`/appointments/${appointmentId}/verify-otp`, { otp });
  return res.data;
};

export const resendOtp = async (appointmentId) => {
  const res = await axiosInstance.post(`/appointments/${appointmentId}/resend-otp`);
  return res.data;
};

// ---------------- Doctor (dashboard, schedule) ----------------
export const fetchDoctorDashboard = async () => {
  const res = await axiosInstance.get("/doctors/dashboard");
  return res.data;
};

export const fetchDoctorSchedule = async (view = "day") => {
  const res = await axiosInstance.get(`/doctors/work-schedule?view=${view}`);
  return res.data;
};
