// src/services/bookingService.js
import axiosInstance from "../utils/axiosInstance";

const handleResponse = (res) => res?.data?.data || [];
const handleError = (error, message) => {
  console.error(message, error);
  throw error;
};

// ---------------- Locations ----------------
export const fetchLocations = async () => {
  try {
    const res = await axiosInstance.get("/locations");
    return handleResponse(res);
  } catch (err) {
    handleError(err, "Lỗi khi fetch locations:");
  }
};

// ---------------- Specialties ----------------
export const fetchSpecialties = async () => {
  try {
    const res = await axiosInstance.get("/specialties");
    return handleResponse(res);
  } catch (err) {
    handleError(err, "Lỗi khi fetch specialties:");
  }
};

// ---------------- Doctors ----------------
export const fetchDoctors = async (locationId, specialtyId) => {
  try {
    const res = await axiosInstance.get("/doctors", {
      params: { locationId, specialtyId },
    });
    return handleResponse(res);
  } catch (err) {
    handleError(err, "Lỗi khi fetch doctors:");
  }
};

// ---------------- Slots ----------------
export const getAvailableSlots = async (doctorId, date) => {
  try {
    const res = await axiosInstance.get(`/doctors/${doctorId}/available-slots`, {
      params: { date },
    });
    return handleResponse(res);
  } catch (err) {
    handleError(err, "Lỗi khi fetch available slots:");
  }
};

// ---------------- Appointment (patient) ----------------
export const createAppointment = async (payload) => {
  try {
    const res = await axiosInstance.post("/appointments", payload);
    return handleResponse(res);
  } catch (err) {
    handleError(err, "Lỗi khi tạo appointment:");
  }
};

export const fetchAppointments = async () => {
  try {
    const res = await axiosInstance.get("/appointments/me");
    return handleResponse(res);
  } catch (err) {
    handleError(err, "Lỗi khi fetch appointments:");
  }
};

export const cancelAppointment = async (id) => {
  try {
    const res = await axiosInstance.delete(`/appointments/${id}`);
    return handleResponse(res);
  } catch (err) {
    handleError(err, "Lỗi khi cancel appointment:");
  }
};

// ---------------- OTP ----------------
export const verifyOtp = async (appointmentId, otp) => {
  try {
    const res = await axiosInstance.post(`/appointments/${appointmentId}/verify-otp`, { otp });
    return handleResponse(res);
  } catch (err) {
    handleError(err, "Lỗi khi verify OTP:");
  }
};

export const resendOtp = async (appointmentId) => {
  try {
    const res = await axiosInstance.post(`/appointments/${appointmentId}/resend-otp`);
    return handleResponse(res);
  } catch (err) {
    handleError(err, "Lỗi khi resend OTP:");
  }
};

// ---------------- Doctor (dashboard, schedule) ----------------
export const fetchDoctorDashboard = async () => {
  try {
    const res = await axiosInstance.get("/doctors/dashboard");
    return handleResponse(res);
  } catch (err) {
    handleError(err, "Lỗi khi fetch doctor dashboard:");
  }
};

export const fetchDoctorSchedule = async (view = "day") => {
  try {
    const res = await axiosInstance.get(`/doctors/work-schedule?view=${view}`);
    return handleResponse(res);
  } catch (err) {
    handleError(err, "Lỗi khi fetch doctor schedule:");
  }
};
